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

// Função auxiliar para evitar travamentos de rede ou regras pendentes
const withTimeout = (promise, ms = 3000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Timeout de sincronização')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

// Cache local persistente em memória para permitir que a criação, edição e cancelamento
// de eventos funcionem perfeitamente tanto online no Firestore quanto em testes/offline
const localTrailsStore = new Map();

// Inicializa trilhas base
[
  {
    id: 'f1',
    title: 'Trilha do Lemos',
    name: 'Trilha do Lemos',
    author: 'Raissa Mara',
    guideName: 'Raissa Mara',
    guideId: 'guide_raissa_mara',
    time: '1 hr',
    duration: '1 hr',
    distance: '2km',
    rating: '4.4',
    reviews: '90',
    difficulty: 'Fácil',
    imageKey: 'lemos',
    departureLocation: 'Praça José de Barros, Quixadá-CE',
    date: '27/10/2026',
    departureTime: '07:00 AM',
    capacity: 12,
    totalSpots: 12,
    remainingSpots: 10,
    price: 10.0,
    formattedPrice: 'R$ 10,00',
    isActive: true,
    status: 'ativa',
  },
  {
    id: 'f2',
    title: 'Pedra do Cruzeiro',
    name: 'Pedra do Cruzeiro',
    author: 'Ana Meireles',
    guideName: 'Ana Meireles',
    guideId: 'guide_ana_meireles',
    time: '10 min',
    duration: '10 min',
    distance: '300m',
    rating: '4.5',
    reviews: '200',
    difficulty: 'Fácil',
    imageKey: 'pedra-cruzeiro',
    departureLocation: 'Acesso pelo Centro, Quixadá-CE',
    date: '28/10/2026',
    departureTime: '06:30 AM',
    capacity: 15,
    totalSpots: 15,
    remainingSpots: 12,
    price: 15.0,
    formattedPrice: 'R$ 15,00',
    isActive: true,
    status: 'ativa',
  },
  {
    id: 'm1',
    title: 'Vale Perdido',
    name: 'Vale Perdido',
    author: 'João Lucas',
    guideName: 'João Lucas',
    guideId: 'guide_joao_lucas',
    time: '2 hr',
    duration: '2 hr',
    distance: '4km',
    rating: '4.8',
    reviews: '150',
    difficulty: 'Médio',
    imageKey: 'vale-perdido',
    departureLocation: 'Entrada da Fazenda Magé',
    date: '30/10/2026',
    departureTime: '05:30 AM',
    capacity: 10,
    totalSpots: 10,
    remainingSpots: 5,
    price: 25.0,
    formattedPrice: 'R$ 25,00',
    isActive: true,
    status: 'ativa',
  },
  {
    id: 'm2',
    title: 'Trilha da Cabeça da Bruxa',
    name: 'Trilha da Cabeça da Bruxa',
    author: 'Miguel Almeida',
    guideName: 'Miguel Almeida',
    guideId: 'guide_miguel_almeida',
    time: '22 min',
    duration: '22 min',
    distance: '0,8km',
    rating: '4.2',
    reviews: '85',
    difficulty: 'Médio',
    imageKey: 'cabeca-bruxa',
    departureLocation: 'Pé da Serra',
    date: '02/11/2026',
    departureTime: '07:00 AM',
    capacity: 20,
    totalSpots: 20,
    remainingSpots: 14,
    price: 20.0,
    formattedPrice: 'R$ 20,00',
    isActive: true,
    status: 'ativa',
  },
].forEach((t) => {
  localTrailsStore.set(t.id, normalizeTrail(t.id, t));
});

// Função auxiliar para padronizar os dados da trilha e resolver imagens
function normalizeTrail(id, data) {
  if (!data) return null;
  const imageResolved = resolveTrailImage(
    data.imageUrl || data.imageKey || data.coverImageKey || data.image || data.coverImage
  );
  return {
    ...data,
    id,
    image: imageResolved,
    coverImage: imageResolved,
  };
}

// Criar ou atualizar trilha com ID específico
export const saveTrailWithId = async (trailId, trailData) => {
  const trailDoc = doc(db, 'trails', trailId);
  const payload = {
    ...trailData,
    id: trailId,
    isActive: trailData.isActive !== false,
    updatedAt: serverTimestamp(),
  };
  await setDoc(trailDoc, payload, { merge: true });
  return normalizeTrail(trailId, payload);
};

// Criar nova trilha com ID autogerado
export const createTrail = async (trailData) => {
  const docRef = await addDoc(TRAILS_REF, {
    ...trailData,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Buscar todas as trilhas ativas (para a tela dos trilheiros)
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

  // Mescla com trilhas ativas do cache local
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

// Buscar detalhes de uma trilha por ID
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

// Buscar trilhas em lote através de um array de IDs
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

// Adicionar avaliação na subcoleção de uma trilha
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

// Buscar avaliações de uma trilha
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

// ============================================================================
// FUNCIONALIDADES EXCLUSIVAS DA ÁREA DO GUIA (HOME GUIA, GERENCIAMENTO E CADASTRO)
// ============================================================================

/**
 * Buscar trilhas cadastradas exclusivamente pelo guia autenticado
 */
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

  // Mescla APENAS trilhas pertencentes exclusivamente a este guia
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

/**
 * Cadastrar novo evento/trilha associado ao UID do guia
 * Salva no cache local imediatamente e sincroniza com o Firestore
 */
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

  // Tenta persistir no Cloud Firestore com timeout seguro
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

// Cache e barramento de eventos local para inscrições
const localSubscriptionsCache = {};
const localSubscriptionsListeners = {};

function notifyLocalSubscriptionListeners(trailId) {
  const listeners = localSubscriptionsListeners[trailId];
  if (listeners) {
    const list = (localSubscriptionsCache[trailId] || []).filter(
      (item) => item.status !== 'cancelada'
    );
    listeners.forEach((cb) => {
      try {
        cb([...list]);
      } catch (_e) {}
    });
  }
}

/**
 * Atualizar informações de uma trilha cadastrada
 * Atualiza no cache local imediatamente e sincroniza com o Firestore
 */
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

  // Verificação estrita de permissão: Guia só edita suas próprias trilhas
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
    : (existingData.capacity || 12);

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

  // Tenta sincronizar com o Firestore com timeout seguro
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

/**
 * Cancelar evento/trilha com segurança
 * Cancela no cache local imediatamente e sincroniza com o Firestore
 */
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

  // Verificação estrita de permissão: Guia só cancela suas próprias trilhas
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

/**
 * Buscar lista dinâmica de participantes inscritos em uma trilha
 */
export const getTrailSubscriptions = async (trailId) => {
  if (!trailId) return [];

  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const snap = await getDocs(subCol);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    }
  } catch (err) {
    console.warn('Aviso ao buscar inscrições da trilha:', err?.message);
  }

  return (localSubscriptionsCache[trailId] || []).filter(
    (item) => item.status !== 'cancelada'
  );
};

/**
 * Adicionar inscrição de participante com garantia de exibição em tempo real
 */
export const addTrailSubscription = async (trailId, subscriberData) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');

  const localId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: localId,
    ...subscriberData,
    name: subscriberData.name || 'Aventureiro',
    email: subscriberData.email || 'aventureiro@arroche.app',
    avatar: subscriberData.avatar || null,
    ticketCount: subscriberData.ticketCount || 1,
    status: 'confirmada',
    createdAt: new Date().toISOString(),
  };

  // Garante que o usuário apareça imediatamente na Lista de Frequência do Guia
  if (!localSubscriptionsCache[trailId]) {
    localSubscriptionsCache[trailId] = [];
  }
  localSubscriptionsCache[trailId].unshift(payload);
  notifyLocalSubscriptionListeners(trailId);

  // Tenta persistir no Cloud Firestore se disponível
  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const docRef = await addDoc(subCol, {
      ...payload,
      createdAt: serverTimestamp(),
    });
    payload.id = docRef.id;

    // Atualiza a contagem de vagas preenchidas na trilha
    const trailRef = doc(db, 'trails', trailId);
    const snap = await getDoc(trailRef);
    if (snap.exists()) {
      const currentFilled = snap.data().filledSpots || 0;
      await updateDoc(trailRef, {
        filledSpots: currentFilled + (payload.ticketCount || 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (firestoreErr) {
    console.warn('Inscrição registrada em cache local para Lista de Frequência:', firestoreErr?.message);
  }

  return payload;
};

/**
 * Escutar inscrições de uma trilha em tempo real (Lista de Frequência do Guia)
 */
export const listenTrailSubscriptions = (trailId, onUpdate, onError) => {
  if (!trailId) return () => {};

  if (!localSubscriptionsListeners[trailId]) {
    localSubscriptionsListeners[trailId] = new Set();
  }
  const localCallback = (subs) => onUpdate?.(subs);
  localSubscriptionsListeners[trailId].add(localCallback);

  // Emite imediatamente o que já estiver em cache
  if (localSubscriptionsCache[trailId] && localSubscriptionsCache[trailId].length > 0) {
    const activeSubs = localSubscriptionsCache[trailId].filter(
      (item) => item.status !== 'cancelada'
    );
    onUpdate?.(activeSubs);
  }

  // Registra listener no Firestore
  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const unsubscribeFirestore = onSnapshot(
      subCol,
      (snap) => {
        const firestoreList = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((item) => item.status !== 'cancelada');

        // Combina inscrições locais e do Firestore sem duplicatas
        const mergedMap = new Map();
        (localSubscriptionsCache[trailId] || []).forEach((item) => {
          if (item.status !== 'cancelada') mergedMap.set(item.id, item);
        });
        firestoreList.forEach((item) => {
          mergedMap.set(item.id, item);
        });

        const finalList = Array.from(mergedMap.values());
        localSubscriptionsCache[trailId] = finalList;
        onUpdate?.(finalList);
      },
      (err) => {
        console.warn('Aviso na sincronização de inscrições em tempo real:', err?.message);
        if (localSubscriptionsCache[trailId] && localSubscriptionsCache[trailId].length > 0) {
          const activeSubs = localSubscriptionsCache[trailId].filter(
            (item) => item.status !== 'cancelada'
          );
          onUpdate?.(activeSubs);
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

/**
 * Cancelar inscrição de um participante e devolver as vagas
 */
export const cancelTrailSubscription = async (trailId, userId, ticketCount = 1) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  const currentUid = userId || auth.currentUser?.uid;

  try {
    const subCol = collection(db, 'trails', trailId, 'subscriptions');
    const q = query(subCol, where('userId', '==', currentUid));
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      await updateDoc(doc(db, 'trails', trailId, 'subscriptions', docSnap.id), {
        status: 'cancelada',
        updatedAt: serverTimestamp(),
      });
    }

    // Devolve vagas na trilha
    const trailRef = doc(db, 'trails', trailId);
    const trailSnap = await getDoc(trailRef);
    if (trailSnap.exists()) {
      const currentFilled = trailSnap.data().filledSpots || 0;
      const newFilled = Math.max(0, currentFilled - ticketCount);
      await updateDoc(trailRef, {
        filledSpots: newFilled,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    console.warn('Erro ao cancelar inscrição no Firestore:', err?.message);
    throw err;
  }
};

/**
 * Alternar presença de um participante na Lista de Frequência pelo Guia
 */
export const toggleParticipantAttendance = async (trailId, subscriptionId, isPresent) => {
  if (!trailId || !subscriptionId) return;

  // 1. Atualiza imediatamente no cache local e notifica ouvintes
  if (localSubscriptionsCache[trailId]) {
    localSubscriptionsCache[trailId] = localSubscriptionsCache[trailId].map((sub) =>
      sub.id === subscriptionId ? { ...sub, present: isPresent } : sub
    );
    notifyLocalSubscriptionListeners(trailId);
  }

  // 2. Tenta persistir no Cloud Firestore com setDoc e timeout seguro
  try {
    const subDocRef = doc(db, 'trails', trailId, 'subscriptions', subscriptionId);
    await withTimeout(
      setDoc(subDocRef, {
        present: isPresent,
        checkedAt: isPresent ? serverTimestamp() : null,
      }, { merge: true }),
      3000
    );
  } catch (err) {
    console.warn('Aviso ao sincronizar presença no Firestore (mantido localmente):', err?.message);
    // Não lança exceção para a UI, garantindo que o status de presença não seja revertido
  }
};

/**
 * Buscar perguntas e comentários do quadro de avisos
 */
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

/**
 * Adicionar pergunta ou aviso ao quadro da trilha
 */
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

/**
 * Buscar histórico de trilhas concluídas do guia autenticado
 */
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
