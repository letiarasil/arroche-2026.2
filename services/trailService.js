import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc,
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages';

const TRAILS_REF = collection(db, 'trails');

function normalizeTrail(id, data) {
  if (!data) return null;
  return {
    ...data,
    id,
    image: resolveTrailImage(data.imageKey || data.image || data.imageUrl),
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

// Buscar todas as trilhas ativas
export const getActiveTrails = async () => {
  try {
    const q = query(
      TRAILS_REF, 
      where('isActive', '==', true), 
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => normalizeTrail(d.id, d.data()));
  } catch (err) {
    // Fallback caso a ordenação exija índice composto no Firestore
    const snap = await getDocs(TRAILS_REF);
    return snap.docs
      .filter(d => d.data().isActive !== false)
      .map(d => normalizeTrail(d.id, d.data()));
  }
};

// Buscar detalhes de uma trilha por ID
export const getTrailById = async (trailId) => {
  const trailRef = doc(db, 'trails', trailId);
  const snap = await getDoc(trailRef);
  
  if (snap.exists()) {
    return normalizeTrail(snap.id, snap.data());
  }
  return null;
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
  const reviewsRef = collection(db, 'trails', trailId, 'reviews');
  const q = query(reviewsRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
