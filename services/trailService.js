import { db, auth } from './firebase';
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
  serverTimestamp 
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages';

const TRAILS_REF = collection(db, 'trails');

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
  try {
    const q = query(
      TRAILS_REF, 
      where('isActive', '==', true), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTrail(d.id, d.data()));
  } catch (err) {
    try {
      const qSimple = query(TRAILS_REF, where('isActive', '==', true));
      const snap = await getDocs(qSimple);
      return snap.docs.map((d) => normalizeTrail(d.id, d.data()));
    } catch (_e) {
      return [];
    }
  }
};

// Buscar detalhes de uma trilha por ID
export const getTrailById = async (trailId) => {
  if (!trailId) return null;
  try {
    const trailRef = doc(db, 'trails', trailId);
    const snap = await getDoc(trailRef);
    if (snap.exists()) {
      return normalizeTrail(snap.id, snap.data());
    }
  } catch (err) {
    console.error('Erro ao buscar trilha por ID:', err?.message);
  }
  return null;
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
export const getGuideTrails = async (guideId) => {
  // Garante que o guideId é o UID autenticado real
  const currentUid = guideId || auth.currentUser?.uid;
  if (!currentUid) return [];

  try {
    const q = query(TRAILS_REF, where('guideId', '==', currentUid));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => normalizeTrail(d.id, d.data()))
      .filter((t) => t.status !== 'cancelada' && t.status !== 'concluida');
  } catch (err) {
    console.error('Erro ao consultar trilhas do guia no Firestore:', err?.message);
    throw err;
  }
};

/**
 * Cadastrar novo evento/trilha associado ao UID real do guia autenticado
 */
export const createGuideTrail = async (guideId, trailData) => {
  const currentUid = guideId || auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error('Usuário não autenticado no Firebase. Faça login novamente.');
  }

  const title = trailData.title || trailData.name || 'Nova Trilha';
  const guideName = trailData.guideName || 'Guia profissional';

  const capacityNum = parseInt(trailData.capacity || trailData.totalSpots || 12, 10) || 12;
  const priceNum = parseFloat(String(trailData.price || '0').replace('R$', '').replace(',', '.').trim()) || 0.0;

  const payload = {
    ...trailData,
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
    capacity: capacityNum,
    totalSpots: capacityNum,
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(TRAILS_REF, payload);
  return normalizeTrail(docRef.id, { ...payload, id: docRef.id });
};

/**
 * Atualizar informações de uma trilha cadastrada
 * Valida a propriedade da trilha garantindo que o guia só edite suas próprias trilhas
 */
export const updateGuideTrail = async (trailId, guideId, updateData) => {
  const currentUid = guideId || auth.currentUser?.uid;
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  if (!currentUid) throw new Error('Usuário não autenticado no Firebase');

  const trailRef = doc(db, 'trails', trailId);
  const snap = await getDoc(trailRef);

  if (!snap.exists()) {
    throw new Error('Trilha não encontrada');
  }

  const existingData = snap.data();
  if (existingData.guideId && existingData.guideId !== currentUid) {
    throw new Error('Permissão negada: você só pode editar suas próprias trilhas');
  }

  const capacityNum = updateData.capacity !== undefined 
    ? parseInt(updateData.capacity, 10) 
    : (existingData.capacity || 12);

  const priceNum = updateData.price !== undefined 
    ? parseFloat(String(updateData.price).replace('R$', '').replace(',', '.').trim()) 
    : (existingData.price || 0.0);

  const payload = {
    ...updateData,
    title: updateData.title || existingData.title,
    name: updateData.title || existingData.name,
    description: updateData.description !== undefined ? updateData.description : existingData.description,
    departureLocation: updateData.departureLocation || existingData.departureLocation,
    date: updateData.date || existingData.date,
    departureTime: updateData.departureTime || existingData.departureTime,
    duration: updateData.duration || existingData.duration,
    distance: updateData.distance || existingData.distance,
    capacity: capacityNum,
    totalSpots: capacityNum,
    price: priceNum,
    formattedPrice: `R$ ${priceNum.toFixed(2).replace('.', ',')}`,
    difficulty: updateData.difficulty || existingData.difficulty,
    imageUrl: updateData.imageUrl !== undefined ? updateData.imageUrl : existingData.imageUrl,
    galleryUrls: updateData.galleryUrls !== undefined ? updateData.galleryUrls : existingData.galleryUrls,
    updatedAt: serverTimestamp(),
  };

  await updateDoc(trailRef, payload);
  return normalizeTrail(trailId, { ...existingData, ...payload, id: trailId });
};

/**
 * Cancelar evento/trilha com segurança evitando exclusão acidental
 */
export const cancelGuideTrail = async (trailId, guideId) => {
  const currentUid = guideId || auth.currentUser?.uid;
  if (!trailId) throw new Error('ID da trilha é obrigatório');
  if (!currentUid) throw new Error('Usuário não autenticado');

  const trailRef = doc(db, 'trails', trailId);
  const snap = await getDoc(trailRef);

  if (!snap.exists()) {
    throw new Error('Trilha não encontrada');
  }

  const existingData = snap.data();
  if (existingData.guideId && existingData.guideId !== currentUid) {
    throw new Error('Permissão negada: você só pode cancelar suas próprias trilhas');
  }

  await updateDoc(trailRef, {
    status: 'cancelada',
    isActive: false,
    updatedAt: serverTimestamp(),
  });

  return { id: trailId, ...existingData, status: 'cancelada', isActive: false };
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
    console.warn('Erro ao buscar inscrições da trilha:', err?.message);
  }

  return [];
};

/**
 * Adicionar inscrição de participante no Firestore
 */
export const addTrailSubscription = async (trailId, subscriberData) => {
  if (!trailId) throw new Error('ID da trilha é obrigatório');

  const subCol = collection(db, 'trails', trailId, 'subscriptions');
  const payload = {
    ...subscriberData,
    name: subscriberData.name || 'Aventureiro',
    email: subscriberData.email || 'aventureiro@arroche.app',
    avatar: subscriberData.avatar || null,
    ticketCount: subscriberData.ticketCount || 1,
    status: 'confirmada',
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(subCol, payload);

  // Atualiza a contagem de vagas preenchidas na trilha
  try {
    const trailRef = doc(db, 'trails', trailId);
    const snap = await getDoc(trailRef);
    if (snap.exists()) {
      const currentFilled = snap.data().filledSpots || 0;
      await updateDoc(trailRef, {
        filledSpots: currentFilled + (payload.ticketCount || 1),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (_e) {}

  return { id: docRef.id, ...payload };
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
  if (!currentUid) return [];

  try {
    const q = query(
      TRAILS_REF, 
      where('guideId', '==', currentUid), 
      where('status', '==', 'concluida')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeTrail(d.id, d.data()));
  } catch (err) {
    console.warn('Erro ao consultar histórico do guia:', err?.message);
    return [];
  }
};
