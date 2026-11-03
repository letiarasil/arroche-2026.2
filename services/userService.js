import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Criar ou atualizar o perfil inicial do usuário
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  
  const payload = {
    name: userData.name || '',
    email: userData.email || '',
    avatarUrl: userData.avatarUrl || null,
    role: userData.role || 'hiker', // 'hiker' ou 'guide'
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, payload, { merge: true });
  return { id: userId, ...payload };
};

// Obter dados do usuário pelo UID
export const getUserProfile = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

// Atualizar dados parciais do perfil
export const updateUserProfile = async (userId, updateData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};