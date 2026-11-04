import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

// Criar ou atualizar o perfil inicial do usuário
export const createUserProfile = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  
  const payload = {
    name: userData.name || '',
    email: userData.email || '',
    avatarUrl: userData.avatarUrl || null,
    role: userData.role || 'hiker', // 'hiker' ou 'guide'
    savedTrails: userData.savedTrails || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(userRef, payload, { merge: true });
  return { id: userId, ...payload };
};

// Obter dados do usuário pelo UID
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};

// Atualizar dados parciais do perfil
export const updateUserProfile = async (userId, updateData) => {
  if (!userId) return;
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

// --- FUNÇÕES DE TRILHAS FAVORITAS / SALVAS ---

// Alternar o estado de salvo/favoritado no perfil do usuário
export const toggleSaveTrailInFirestore = async (userId, trailId, isCurrentlySaved) => {
  if (!userId || !trailId) return;

  const userRef = doc(db, 'users', userId);

  // Utiliza setDoc com merge: true para garantir a gravação mesmo se o documento não existir previamente
  await setDoc(
    userRef,
    {
      savedTrails: isCurrentlySaved ? arrayRemove(trailId) : arrayUnion(trailId),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// Buscar a lista de IDs das trilhas salvas pelo usuário
export const getUserSavedTrailIds = async (userId) => {
  if (!userId) return [];
  const userProfile = await getUserProfile(userId);
  return userProfile?.savedTrails || [];
};