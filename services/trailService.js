import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

const TRAILS_REF = collection(db, 'trails');

// Criar nova trilha
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
  const q = query(
    TRAILS_REF, 
    where('isActive', '==', true), 
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Buscar detalhes de uma trilha por ID
export const getTrailById = async (trailId) => {
  const trailRef = doc(db, 'trails', trailId);
  const snap = await getDoc(trailRef);
  
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
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
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};