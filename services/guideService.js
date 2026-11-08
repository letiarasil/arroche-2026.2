import { db } from './firebase';
import { 
  collection,
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages';

const GUIDES_COLLECTION = 'guides';

export const formatCadastur = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{6})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{6})\.(\d{2})(\d)/, '$1.$2.$3-$4');
};

function normalizeGuideData(id, data) {
  if (!data) return null;

  return {
    ...data,
    id,
    coverImage: resolveTrailImage(data.coverImageKey || data.coverImage),
    availableTrails: (data.availableTrails || []).map((t) => ({
      ...t,
      image: resolveTrailImage(t.imageKey || t.image),
    })),
    sharedPhotos: (data.sharedPhotos || []).map((p) => ({
      ...p,
      image: resolveTrailImage(p.imageKey || p.image),
    })),
  };
}

/**
 * Busca todos os guias cadastrados no Firestore
 */
export const getAllGuides = async () => {
  const colRef = collection(db, GUIDES_COLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs.map((docSnap) => normalizeGuideData(docSnap.id, docSnap.data()));
};

/**
 * Buscar perfil do guia pelo UID do usuário ou ID do documento
 * Possui fallback para os dados de usuário na coleção 'users'
 */
export const getGuideProfile = async (userId) => {
  if (!userId) return null;
  const guideRef = doc(db, GUIDES_COLLECTION, userId);
  const snap = await getDoc(guideRef);

  if (snap.exists()) {
    return normalizeGuideData(snap.id, snap.data());
  }

  // Fallback: se o perfil na coleção 'guides' ainda não foi criado, recupera do 'users'
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const defaultGuide = {
        name: userData.name || 'Guia Arroche',
        displayName: userData.name || 'Guia',
        role: 'Guia Profissional',
        specialties: 'Trilhas • Ecoturismo • Turismo de Aventura',
        bioPrefix: 'Guia cadastrado no aplicativo Arroche, ',
        bioHighlight: 'atuando nas principais trilhas da região',
        bioSuffix: ' com foco em segurança, preservação e aventura.',
        trailsCount: 0,
        ratingAverage: 5.0,
      };
      return normalizeGuideData(userId, defaultGuide);
    }
  } catch (_e) {}

  return null;
};

/**
 * Salvar ou atualizar dados do guia turístico
 */
export const saveGuideProfile = async (userId, guideData) => {
  const guideRef = doc(db, GUIDES_COLLECTION, userId);
  const rawCadastur = guideData.cadasturNumber ? guideData.cadasturNumber.replace(/\D/g, '') : '';

  const payload = {
    ...guideData,
    cadasturNumber: rawCadastur,
    cadasturFormatted: formatCadastur(rawCadastur),
    isVerified: guideData.isVerified || false,
    phone: guideData.phone || '',
    operatingCities: guideData.operatingCities || [],
    bio: guideData.bio || '',
    ratingAverage: guideData.ratingAverage || 0,
    updatedAt: serverTimestamp(),
  };

  await setDoc(guideRef, payload, { merge: true });
  return { id: userId, ...payload };
};

/**
 * Adicionar avaliação/depoimento no perfil do guia
 */
export const addGuideComment = async (guideId, comment) => {
  const guideRef = doc(db, GUIDES_COLLECTION, guideId);
  const snap = await getDoc(guideRef);

  if (snap.exists()) {
    const currentComments = snap.data().comments || [];
    const newEntry = {
      id: `c_${Date.now()}`,
      name: comment.name || 'Aventureiro',
      avatar: comment.avatar || null,
      text: comment.text,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(guideRef, {
      comments: [newEntry, ...currentComments],
      updatedAt: serverTimestamp(),
    });

    return newEntry;
  }
  return null;
};
