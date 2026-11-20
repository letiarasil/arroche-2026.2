import { db, auth } from './firebase.js';
import { 
  collection, 
  doc, 
  setDoc,
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc,
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot 
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages.js';

const TRAILS_REF = collection(db, 'trails');

const withTimeout = (promise, ms = 3000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout de sincronização')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

const localTrailsStore = new Map();

function computeRemainingSpots(data = {}) {
  const totalSpots = Number(data.totalSpots ?? data.capacity ?? data.vagas ?? 0) || 0;
  const filledSpots = Number(data.filledSpots ?? 0) || 0;

  if (typeof data.remainingSpots === 'number') {
    return Math.max(0, data.remainingSpots);
  }
  if (typeof data.vagasRestantes === 'number') {
    return Math.max(0, data.vagasRestantes);
  }
  return Math.max(0, totalSpots - filledSpots);
}

function normalizeTrail(id, data) {
  if (!data) return null;
  const imageResolved = resolveTrailImage(
    data.imageUrl || data.imageKey || data.coverImageKey || data.image || data.coverImage
  );
  const totalSpots = Number(data.totalSpots ?? data.capacity ?? data.vagas ?? 0) || 0;
  const filledSpots = Number(data.filledSpots ?? 0) || 0;
  const remainingSpots = computeRemainingSpots({ ...data, totalSpots, filledSpots });

  return {
    ...data,
    id,
    image: imageResolved,
    coverImage: imageResolved,
    capacity: totalSpots || data.capacity || 0,
    totalSpots: totalSpots || data.totalSpots || 0,
    filledSpots,
    remainingSpots,
    vagasRestantes: remainingSpots,
  };
}

function deduplicateSubscriptions(list = []) {
  const persistedIds = new Set();
  const replacedLocalIds = new Set();

  (list || []).forEach((item) => {
    if (!item || item.status === 'cancelada') return;
    if (item.id && !String(item.id).startsWith('sub_')) {
      persistedIds.add(String(item.id));
      if (item.localId) {
        replacedLocalIds.add(String(item.localId));
      }
    }
  });

  const byDocId = new Map();
  (list || []).forEach((item, idx) => {
    if (!item || item.status === 'cancelada') return;
    const itemId = item.id ? String(item.id) : `sub_fallback_${idx}`;
    const isLocalTemp = itemId.startsWith('sub_');

    if (isLocalTemp && (replacedLocalIds.has(itemId) || persistedIds.has(itemId))) {
      return;
    }

    if (!byDocId.has(itemId)) {
      byDocId.set(itemId, { ...item, id: itemId });
    } else {
      const existing = byDocId.get(itemId);
      const existingLocalTime = existing._localAttendanceAt || 0;
      const candidateLocalTime = item._localAttendanceAt || 0;

      const merged = {
        ...existing,
        ...item,
        id: itemId,
        name: item.name || existing.name,
        email: item.email || existing.email,
        userId: item.userId || existing.userId,
        avatar: item.avatar || existing.avatar,
        ticketCount: item.ticketCount || existing.ticketCount || 1,
        present:
          candidateLocalTime > existingLocalTime
            ? Boolean(item.present)
            : existingLocalTime > candidateLocalTime
              ? Boolean(existing.present)
              : Boolean(existing.present || item.present),
        _localAttendanceAt: Math.max(existingLocalTime, candidateLocalTime),
      };
      byDocId.set(itemId, merged);
    }
  });

  const byHiker = new Map();
  Array.from(byDocId.values()).forEach((item) => {
    if (!item.name && !item.userId && !item.email) return;

    const hikerId = item.userId || item.uid || item.hikerId;
    const hikerKey = hikerId ? `user_${String(hikerId).trim()}` : `sub_${item.id}`;

    if (!byHiker.has(hikerKey)) {
      byHiker.set(hikerKey, item);
    } else {
      const existing = byHiker.get(hikerKey);
      const existingIsRealId = existing.id && !String(existing.id).startsWith('sub_');
      const candidateIsRealId = item.id && !String(item.id).startsWith('sub_');

      const existingLocalTime = existing._localAttendanceAt || 0;
      const candidateLocalTime = item._localAttendanceAt || 0;

      const base = candidateIsRealId && !existingIsRealId
        ? { ...existing, ...item }
        : { ...item, ...existing };

      byHiker.set(hikerKey, {
        ...base,
        id: existingIsRealId ? existing.id : item.id,
        name: item.name || existing.name,
        email: item.email || existing.email,
        userId: hikerId,
        present:
          candidateLocalTime > existingLocalTime
            ? Boolean(item.present)
            : existingLocalTime > candidateLocalTime
              ? Boolean(existing.present)
              : Boolean(existing.present || item.present),
        _localAttendanceAt: Math.max(existingLocalTime, candidateLocalTime),
      });
    }
  });

  return Array.from(byHiker.values());
}

export const saveTrailWithId = async (trailId, trailData) => {
  const trailDoc = doc(db, 'trails', trailId);
  const normalized = normalizeTrail(trailId, trailData);
  const payload = {
    ...trailData,
    id: trailId,
    remainingSpots: normalized.remainingSpots,
    vagasRestantes: normalized.remainingSpots,
    filledSpots: normalized.filledSpots,
    isActive: trailData.isActive !== false,
    updatedAt: serverTimestamp(),
  };
  await setDoc(trailDoc, payload, { merge: true });
  localTrailsStore.set(trailId, normalizeTrail(trailId, payload));
  return normalizeTrail(trailId, payload);
};

export const createTrail = async (trailData) => {
  const capacityNum = Number(trailData.capacity ?? trailData.totalSpots ?? trailData.vagas ?? 12) || 12;
  const filledNum = Number(trailData.filledSpots ?? 0) || 0;
  const remainingNum = Math.max(0, capacityNum - filledNum);

  const docRef = await addDoc(TRAILS_REF, {
    ...trailData,
    capacity: capacityNum,
    totalSpots: capacityNum,
    filledSpots: filledNum,
    remainingSpots: remainingNum,
    vagasRestantes: remainingNum,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getActiveTrails = async () => {
  let firestoreTrails = [];
  try {
    const q = query(
      TRAILS_REF, 
      where('isActive', '==', true), 
      orderBy('createdAt', 'desc')
    );
    const snap = await withTimeout(getDocs(q), 2500);
    firestoreTrails = snap.docs.map((d) => normalizeTrail(d.id, d.data()));
  } catch (err) {
    try {
      const qSimple = query(TRAILS_REF, where('isActive', '==', true));
      const snap = await withTimeout(getDocs(qSimple), 2500);
      firestoreTrails = snap.docs.map((d) => normalizeTrail(d.id, d.data()));
    } catch (_e) {
      firestoreTrails = [];
    }
  }

  const mergedMap = new Map();
  localTrailsStore.forEach((t, id) => {
    if (t && t.isActive !== false && t.status !== 'cancelada') {
      mergedMap.set(id, t);
    }
  });
  firestoreTrails.forEach((t) => {
    if (t && t.isActive !== false && t.status !== 'cancelada') {
      mergedMap.set(t.id, t);
    }
  });

  return Array.from(mergedMap.values());
};

export const getTrailById = async (trailId) => {
  if (!trailId) return null;
  try {
    const trailRef = doc(db, 'trails', trailId);
    const snap = await withTimeout(getDoc(trailRef), 2000);
    if (snap.exists()) {
      const normalized = normalizeTrail(snap.id, snap.data());
      localTrailsStore.set(snap.id, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('Aviso ao buscar trilha no Firestore, utilizando cache:', err?.message);
  }
  return localTrailsStore.get(trailId) || null;
};

export const listenTrailById = (trailId, onUpdate) => {
  if (!trailId) return () => {};
  const trailRef = doc(db, 'trails', trailId);
  return onSnapshot(
    trailRef,
    (snap) => {
      if (snap.exists()) {
        const normalized = normalizeTrail(snap.id, snap.data());
        localTrailsStore.set(snap.id, normalized);
        onUpdate?.(normalized);
      }
    },
    (err) => {
      console.warn('Aviso ao ouvir trilha em tempo real:', err?.message);
    }
  );
};

export const getTrailsByIds = async (trailIds) => {
  if (!trailIds || !Array.isArray(trailIds) || trailIds.length === 0) {
    return [];
  }

  try {
    const promises = trailIds.map((id) => getTrailById(id));
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  } catch (err) {
    console.error('Erro ao buscar trilhas por lista de IDs:', err?.message);
    return [];
  }
};

export const addTrailReview = async (trailId, reviewData, userSummary) => {
  const reviewsRef = collection(db, 'trails', trailId, 'reviews');
  return await addDoc(reviewsRef, {
    userId: reviewData.userId,
    userSummary: {
      name: userSummary.name,
      avatarUrl: userSummary.avatarUrl || null,
    },
    rating: reviewData.rating,
    comment: reviewData.comment || '',
    createdAt: serverTimestamp(),
  });
};

export const getTrailReviews = async (trailId) => {
  try {
    const reviewsRef = collection(db, 'trails', trailId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (_e) {
    return [];
  }
};

export const getGuideTrails = async (guideId, guideName = null) => {
  const currentUid = guideId || auth.currentUser?.uid;
  const normalizedGuideName = (guideName || '').trim().toLowerCase();
  let firestoreTrails = [];

  try {
    if (currentUid && currentUid !== 'guide_default') {
      const q = query(TRAILS_REF, where('guideId', '==', currentUid));
      const snap = await withTimeout(getDocs(q), 2500);
      firestoreTrails = snap.docs.map((d) => normalizeTrail(d.id, d.data()));
    }

    if (normalizedGuideName && firestoreTrails.length === 0) {
      const qAuthor = query(TRAILS_REF, where('author', '==', guideName));
      const snapAuthor = await withTimeout(getDocs(qAuthor), 2500);
      firestoreTrails = snapAuthor.docs.map((d) => normalizeTrail(d.id, d.data()));
    }
  } catch (err) {
    console.warn('Aviso ao consultar trilhas do guia no Firestore, utilizando cache:', err?.message);
  }

  const isTrailOwnedByGuide = (t) => {
    if (!t) return false;
    const trailGuideId = t.guideId;
    const author = (t.author || '').trim().toLowerCase();
    const gName = (t.guideName || '').trim().toLowerCase();

    const matchesUid = Boolean(currentUid && trailGuideId && trailGuideId === currentUid);
    const matchesAuthor = Boolean(normalizedGuideName && author && author === normalizedGuideName);
    const matchesGuideName = Boolean(normalizedGuideName && gName && gName === normalizedGuideName);

    return matchesUid || matchesAuthor || matchesGuideName;
  };

  const mergedMap = new Map();
  localTrailsStore.forEach((t, id) => {
    if (isTrailOwnedByGuide(t)) {
      if (t.status !== 'cancelada' && t.status !== 'concluida') {
        mergedMap.set(id, t);
      }
    }
  });

  firestoreTrails.forEach((t) => {
    if (isTrailOwnedByGuide(t)) {
      if (t.status !== 'cancelada' && t.status !== 'concluida') {
        mergedMap.set(t.id, t);
      }
    }
  });

  return Array.from(mergedMap.values());
};

export const createGuideTrail = async (guideId, trailData) => {
  const currentUid = guideId || auth.currentUser?.uid || 'guide_default';
  const title = trailData.title || trailData.name || 'Nova Trilha';
  const guideName = trailData.guideName || 'Guia profissional';

  const capacityNum = parseInt(trailData.capacity || trailData.totalSpots || 12, 10) || 12;
  const priceNum = parseFloat(String(trailData.price || '0').replace('R$', '').replace(',', '.').trim()) || 0.0;

  const tempId = `trail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const payload = {
    ...trailData,
    id: tempId,
    title,
    name: title,
    guideId: currentUid,
    guideName,
    author: guideName,
    description: trailData.description || '',
    departureLocation: trailData.departureLocation || '',
    date: trailData.date || '',
    departureTime: trailData.departureTime || '',
    distance: trailData.distance || '',
    duration: trailData.duration || '',
    time: trailData.time || trailData.duration || '',
    capacity: capacityNum,
    totalSpots: capacityNum,
    remainingSpots: capacityNum,
    vagasRestantes: capacityNum,
    filledSpots: 0,
    price: priceNum,
    formattedPrice: `R$ ${priceNum.toFixed(2).replace('.', ',')}`,
    difficulty: trailData.difficulty || 'Fácil',
    rating: trailData.rating || 5.0,
    reviews: trailData.reviews || 0,
    imageUrl: trailData.imageUrl || null,
    imageKey: trailData.imageKey || null,
    galleryUrls: trailData.galleryUrls || [],
    isActive: true,
    status: 'ativa',
    createdAt: new Date().toISOString(),
  };

  const normalized = normalizeTrail(tempId, payload);
  localTrailsStore.set(tempId, normalized);

  try {
    const docRef = await withTimeout(
      addDoc(TRAILS_REF, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      3500
    );
    const finalNormalized = normalizeTrail(docRef.id, { ...payload, id: docRef.id });
    localTrailsStore.delete(tempId);
    localTrailsStore.set(docRef.id, finalNormalized);
    return finalNormalized;
  } catch (err) {
    console.warn('Trilha salva no cache local (Firestore offline ou com restrições):', err?.message);
    return normalized;
  }
};

const localSubscriptionsCache = {};
const localSubscriptionsListeners = {};

function notifyLocalSubscriptionListeners(trailId) {
  const listeners = localSubscriptionsListeners[trailId];
  if (listeners) {
    const cleaned = deduplicateSubscriptions(localSubscriptionsCache[trailId] || []);
    localSubscriptionsCache[trailId] = cleaned;
    listeners.forEach((cb) => {
      try {
        cb([...cleaned]);
      } catch (_e) {}
    });
  }
}

export const updateGuideTrail = async (trailId, guideId, updateData) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  const currentUid = guideId || auth.currentUser?.uid || 'guide_default';

  let existingData = localTrailsStore.get(trailId) || {};
  const trailRef = doc(db, 'trails', trailId);

  try {
    const snap = await withTimeout(getDoc(trailRef), 2000);
    if (snap.exists()) {
      existingData = { ...existingData, ...snap.data() };
    }
  } catch (_e) {}

  const ownerId = existingData.guideId;
  const currentGuideName = (updateData.guideName || '').trim().toLowerCase();
  const authorName = (existingData.author || '').trim().toLowerCase();
  const guideNameInTrail = (existingData.guideName || '').trim().toLowerCase();

  const isOwner = Boolean(
    (currentUid && ownerId && ownerId === currentUid) ||
    (currentGuideName && authorName && authorName === currentGuideName) ||
    (currentGuideName && guideNameInTrail && guideNameInTrail === currentGuideName)
  );

  if (!isOwner) {
    throw new Error('Permissão negada: você só pode editar suas próprias trilhas');
  }

  const capacityNum = updateData.capacity !== undefined 
    ? parseInt(updateData.capacity, 10) 
    : (existingData.capacity || existingData.totalSpots || 12);

  const filledNum = Number(existingData.filledSpots ?? 0) || 0;
  const remainingNum = Math.max(0, capacityNum - filledNum);

  const priceNum = updateData.price !== undefined 
    ? parseFloat(String(updateData.price).replace('R$', '').replace(',', '.').trim()) 
    : (existingData.price || 0.0);

  const payload = {
    ...existingData,
    ...updateData,
    title: updateData.title || existingData.title || 'Trilha',
    name: updateData.title || existingData.name || 'Trilha',
    description: updateData.description !== undefined ? updateData.description : (existingData.description || ''),
    departureLocation: updateData.departureLocation || existingData.departureLocation || '',
    date: updateData.date || existingData.date || '',
    departureTime: updateData.departureTime || existingData.departureTime || '',
    duration: updateData.duration || existingData.duration || '',
    distance: updateData.distance || existingData.distance || '',
    capacity: capacityNum,
    totalSpots: capacityNum,
    filledSpots: filledNum,
    remainingSpots: remainingNum,
    vagasRestantes: remainingNum,
    price: priceNum,
    formattedPrice: `R$ ${priceNum.toFixed(2).replace('.', ',')}`,
    difficulty: updateData.difficulty || existingData.difficulty || 'Fácil',
    imageUrl: updateData.imageUrl !== undefined ? updateData.imageUrl : existingData.imageUrl,
    galleryUrls: updateData.galleryUrls !== undefined ? updateData.galleryUrls : (existingData.galleryUrls || []),
    guideId: existingData.guideId || currentUid,
    author: existingData.author || updateData.guideName || 'Guia',
    isActive: true,
  };

  const updatedNormalized = normalizeTrail(trailId, { ...payload, id: trailId });
  localTrailsStore.set(trailId, updatedNormalized);

  try {
    await withTimeout(
      setDoc(trailRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true }),
      3500
    );
  } catch (err) {
    console.warn('Alterações salvas localmente (Firestore offline ou restrito):', err?.message);
  }

  return updatedNormalized;
};

export const cancelGuideTrail = async (trailId, guideId, guideName = '') => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  const currentUid = guideId || auth.currentUser?.uid || 'guide_default';

  let existingData = localTrailsStore.get(trailId) || {};
  const trailRef = doc(db, 'trails', trailId);

  try {
    const snap = await withTimeout(getDoc(trailRef), 2000);
    if (snap.exists()) {
      existingData = { ...existingData, ...snap.data() };
    }
  } catch (_e) {}

  const ownerId = existingData.guideId;
  const currentGuideName = (guideName || '').trim().toLowerCase();
  const authorName = (existingData.author || '').trim().toLowerCase();
  const guideNameInTrail = (existingData.guideName || '').trim().toLowerCase();

  const isOwner = Boolean(
    (currentUid && ownerId && ownerId === currentUid) ||
    (currentGuideName && authorName && authorName === currentGuideName) ||
    (currentGuideName && guideNameInTrail && guideNameInTrail === currentGuideName)
  );

  if (!isOwner) {
    throw new Error('Permissão negada: você só pode cancelar suas próprias trilhas');
  }

  const updatedData = {
    ...existingData,
    status: 'cancelada',
    isActive: false,
    id: trailId,
  };

  const updatedNormalized = normalizeTrail(trailId, updatedData);
  localTrailsStore.set(trailId, updatedNormalized);

  try {
    await withTimeout(
      setDoc(trailRef, { status: 'cancelada', isActive: false, updatedAt: serverTimestamp() }, { merge: true }),
      3500
    );
  } catch (err) {
    console.warn('Cancelamento salvo localmente (Firestore offline ou restrito):', err?.message);
  }

  return updatedNormalized;
};

export const getTrailSubscriptions = async (trailId) => {
  if (!trailId) return [];

  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const snap = await getDocs(subCol);
    if (!snap.empty) {
      const firestoreList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return deduplicateSubscriptions([
        ...(localSubscriptionsCache[trailId] || []),
        ...firestoreList,
      ]);
    }
  } catch (err) {
    console.warn('Aviso ao buscar inscrições da trilha:', err?.message);
  }

  return deduplicateSubscriptions(localSubscriptionsCache[trailId] || []);
};

export const addTrailSubscription = async (trailId, subscriberData) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');

  const hikerId = subscriberData?.userId || subscriberData?.uid || auth.currentUser?.uid || null;
  const requestedTickets = Math.max(1, Number(subscriberData?.ticketCount || 1) || 1);

  const applyLocalSpotsChange = (deltaFilled) => {
    const cachedTrail = localTrailsStore.get(trailId);
    if (cachedTrail) {
      const currentTotal = Number(cachedTrail.totalSpots ?? cachedTrail.capacity ?? 0) || 0;
      const currentFilled = Math.max(0, (Number(cachedTrail.filledSpots ?? 0) || 0) + deltaFilled);
      const currentRemaining = computeRemainingSpots(cachedTrail);
      const newRemaining =
        currentTotal > 0
          ? Math.max(0, Math.min(currentTotal, currentRemaining - deltaFilled))
          : Math.max(0, currentRemaining - deltaFilled);

      localTrailsStore.set(trailId, {
        ...cachedTrail,
        filledSpots: currentFilled,
        remainingSpots: newRemaining,
        vagasRestantes: newRemaining,
      });
    }
  };

  const cachedList = deduplicateSubscriptions(localSubscriptionsCache[trailId] || []);

  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    let previousActiveTickets = 0;

    if (hikerId) {
      const q = query(subCol, where('userId', '==', hikerId));
      const existingSnap = await getDocs(q);
      for (const d of existingSnap.docs) {
        const dData = d.data() || {};
        if (dData.status !== 'cancelada') {
          previousActiveTickets += Math.max(1, Number(dData.ticketCount ?? 1) || 1);
          await updateDoc(doc(db, 'trails', trailId, 'subscriptions', d.id), {
            status: 'cancelada',
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    const netDeltaTickets = requestedTickets - previousActiveTickets;

    const localId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const basePayload = {
      ...subscriberData,
      userId: hikerId,
      localId,
      name: subscriberData.name || 'Aventureiro',
      email: subscriberData.email || 'aventureiro@arroche.app',
      avatar: subscriberData.avatar || null,
      ticketCount: requestedTickets,
      present: Boolean(subscriberData.present),
      status: 'confirmada',
    };

    const tempPayload = {
      ...basePayload,
      id: localId,
      createdAt: new Date().toISOString(),
    };

    const filteredCache = cachedList.filter(
      (item) => String(item.userId || item.uid || '') !== String(hikerId)
    );
    localSubscriptionsCache[trailId] = deduplicateSubscriptions([tempPayload, ...filteredCache]);
    applyLocalSpotsChange(netDeltaTickets);
    notifyLocalSubscriptionListeners(trailId);

    const docRef = await addDoc(subCol, {
      ...basePayload,
      createdAt: serverTimestamp(),
    });

    const persistedItem = {
      ...tempPayload,
      id: docRef.id,
    };

    localSubscriptionsCache[trailId] = deduplicateSubscriptions([
      persistedItem,
      ...(localSubscriptionsCache[trailId] || []).filter((item) => item.id !== localId),
    ]);
    notifyLocalSubscriptionListeners(trailId);

    const trailRef = doc(db, 'trails', trailId);
    const snap = await getDoc(trailRef);
    if (snap.exists()) {
      const tData = snap.data();
      const totalSpots = Number(tData.totalSpots ?? tData.capacity ?? 0) || 0;
      const currentFilled = Number(tData.filledSpots ?? 0) || 0;
      const currentRemaining = computeRemainingSpots(tData);

      const newFilled = Math.max(0, currentFilled + netDeltaTickets);
      const newRemaining =
        totalSpots > 0
          ? Math.max(0, Math.min(totalSpots, currentRemaining - netDeltaTickets))
          : Math.max(0, currentRemaining - netDeltaTickets);

      await updateDoc(trailRef, {
        filledSpots: newFilled,
        remainingSpots: newRemaining,
        vagasRestantes: newRemaining,
        updatedAt: serverTimestamp(),
      });

      localTrailsStore.set(trailId, normalizeTrail(trailId, {
        ...tData,
        filledSpots: newFilled,
        remainingSpots: newRemaining,
        vagasRestantes: newRemaining,
      }));
    }

    return persistedItem;
  } catch (firestoreErr) {
    const localId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fallbackPayload = {
      ...subscriberData,
      userId: hikerId,
      id: localId,
      localId,
      name: subscriberData.name || 'Aventureiro',
      email: subscriberData.email || 'aventureiro@arroche.app',
      avatar: subscriberData.avatar || null,
      ticketCount: requestedTickets,
      present: Boolean(subscriberData.present),
      status: 'confirmada',
      createdAt: new Date().toISOString(),
    };

    localSubscriptionsCache[trailId] = deduplicateSubscriptions([fallbackPayload, ...cachedList]);
    applyLocalSpotsChange(requestedTickets);
    notifyLocalSubscriptionListeners(trailId);
    console.warn('Inscrição registrada em cache local para Lista de Frequência:', firestoreErr?.message);
    return fallbackPayload;
  }
};

export const listenTrailSubscriptions = (trailId, onUpdate, onError) => {
  if (!trailId) return () => {};

  if (!localSubscriptionsListeners[trailId]) {
    localSubscriptionsListeners[trailId] = new Set();
  }
  const localCallback = (subs) => onUpdate?.(deduplicateSubscriptions(subs));
  localSubscriptionsListeners[trailId].add(localCallback);

  if (localSubscriptionsCache[trailId] && localSubscriptionsCache[trailId].length > 0) {
    onUpdate?.(deduplicateSubscriptions(localSubscriptionsCache[trailId]));
  }

  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const unsubscribeFirestore = onSnapshot(
      subCol,
      (snap) => {
        const firestoreList = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.status !== 'cancelada');

        const finalList = deduplicateSubscriptions([
          ...(localSubscriptionsCache[trailId] || []),
          ...firestoreList,
        ]);

        localSubscriptionsCache[trailId] = finalList;
        onUpdate?.(finalList);
      },
      (err) => {
        console.warn('Aviso na sincronização de inscrições em tempo real:', err?.message);
        if (localSubscriptionsCache[trailId] && localSubscriptionsCache[trailId].length > 0) {
          onUpdate?.(deduplicateSubscriptions(localSubscriptionsCache[trailId]));
        } else {
          onError?.(err);
        }
      }
    );

    return () => {
      localSubscriptionsListeners[trailId]?.delete(localCallback);
      try { unsubscribeFirestore(); } catch (_e) {}
    };
  } catch (e) {
    return () => {
      localSubscriptionsListeners[trailId]?.delete(localCallback);
    };
  }
};

export const cancelTrailSubscription = async (trailId, userId, ticketCount = 1) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  const currentUid = userId || auth.currentUser?.uid;
  const fallbackTickets = Math.max(1, Number(ticketCount || 1) || 1);
  let ticketsToRestore = 0;

  try {
    if (localSubscriptionsCache[trailId]) {
      const cachedSubs = localSubscriptionsCache[trailId].filter(
        (item) => String(item.userId || item.uid || '') === String(currentUid) && item.status !== 'cancelada'
      );
      if (cachedSubs.length > 0) {
        ticketsToRestore = cachedSubs.reduce(
          (sum, item) => sum + Math.max(1, Number(item.ticketCount ?? 1) || 1),
          0
        );
      }
    }

    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const q = query(subCol, where('userId', '==', currentUid));
    const snap = await getDocs(q);

    let firestoreTickets = 0;
    for (const docSnap of snap.docs) {
      const subData = docSnap.data() || {};
      if (subData.status !== 'cancelada') {
        firestoreTickets += Math.max(1, Number(subData.ticketCount ?? 1) || 1);
      }

      await updateDoc(doc(db, 'trails', trailId, 'subscriptions', docSnap.id), {
        status: 'cancelada',
        updatedAt: serverTimestamp(),
      });
    }

    if (firestoreTickets > 0) {
      ticketsToRestore = firestoreTickets;
    } else if (ticketsToRestore <= 0) {
      ticketsToRestore = fallbackTickets;
    }

    if (localSubscriptionsCache[trailId]) {
      localSubscriptionsCache[trailId] = localSubscriptionsCache[trailId].filter(
        (item) => String(item.userId || item.uid || '') !== String(currentUid)
      );
      notifyLocalSubscriptionListeners(trailId);
    }

    let finalRemaining = null;
    const trailRef = doc(db, 'trails', trailId);
    const trailSnap = await getDoc(trailRef);
    if (trailSnap.exists()) {
      const tData = trailSnap.data();
      const currentFilled = Number(tData.filledSpots ?? 0) || 0;
      const totalSpots = Number(tData.totalSpots ?? tData.capacity ?? 0) || 0;
      const newFilled = Math.max(0, currentFilled - ticketsToRestore);
      const currentRemaining = computeRemainingSpots(tData);
      const newRemaining =
        totalSpots > 0
          ? Math.min(totalSpots, currentRemaining + ticketsToRestore)
          : currentRemaining + ticketsToRestore;

      await updateDoc(trailRef, {
        filledSpots: newFilled,
        remainingSpots: newRemaining,
        vagasRestantes: newRemaining,
        updatedAt: serverTimestamp(),
      });

      finalRemaining = newRemaining;
      localTrailsStore.set(trailId, normalizeTrail(trailId, {
        ...tData,
        filledSpots: newFilled,
        remainingSpots: newRemaining,
        vagasRestantes: newRemaining,
      }));
    }

    return {
      restoredTickets: ticketsToRestore,
      remainingSpots: finalRemaining,
    };
  } catch (err) {
    console.warn('Erro ao cancelar inscrição no Firestore:', err?.message);
    throw err;
  }
};

export const toggleParticipantAttendance = async (trailId, subscriptionId, isPresent) => {
  if (!trailId || !subscriptionId) return;

  const targetId = String(subscriptionId);
  const localStamp = Date.now();

  if (localSubscriptionsCache[trailId]) {
    localSubscriptionsCache[trailId] = localSubscriptionsCache[trailId].map((sub) =>
      String(sub.id) === targetId || String(sub.localId) === targetId
        ? { ...sub, present: Boolean(isPresent), _localAttendanceAt: localStamp }
        : sub
    );
    notifyLocalSubscriptionListeners(trailId);
  }

  try {
    const subDocRef = doc(db, 'trails', trailId, 'subscriptions', targetId);
    await withTimeout(
      setDoc(
        subDocRef,
        {
          present: Boolean(isPresent),
          checkedAt: isPresent ? serverTimestamp() : null,
        },
        { merge: true }
      ),
      3000
    );
  } catch (err) {
    console.warn('Aviso ao sincronizar presença no Firestore (mantido localmente):', err?.message);
  }
};

export const getTrailQuestions = async (trailId) => {
  if (!trailId) return [];

  try {
    const colRef = collection(db, 'trails', trailId, 'questions');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Erro ao buscar mensagens do quadro:', err?.message);
  }

  return [];
};

export const addTrailQuestion = async (trailId, messageData) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');

  const colRef = collection(db, 'trails', trailId, 'questions');
  const payload = {
    ...messageData,
    userName: messageData.userName || 'Guia',
    userAvatar: messageData.userAvatar || null,
    text: messageData.text || '',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
};

export const getGuideHistory = async (guideId) => {
  const currentUid = guideId || auth.currentUser?.uid;
  let firestoreHistory = [];

  try {
    if (currentUid) {
      const q = query(
        TRAILS_REF, 
        where('guideId', '==', currentUid), 
        where('status', '==', 'concluida')
      );
      const snap = await withTimeout(getDocs(q), 2500);
      firestoreHistory = snap.docs.map((d) => normalizeTrail(d.id, d.data()));
    }
  } catch (err) {
    console.warn('Aviso ao consultar histórico do guia no Firestore, utilizando cache:', err?.message);
  }

  const mergedMap = new Map();
  localTrailsStore.forEach((t, id) => {
    if (t.status === 'concluida' || t.status === 'cancelada') {
      mergedMap.set(id, t);
    }
  });
  firestoreHistory.forEach((t) => {
    mergedMap.set(t.id, t);
  });

  return Array.from(mergedMap.values());
};