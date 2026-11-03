import { db } from './firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// Função auxiliar para formatar a máscara do CADASTUR (ex: 12.345678.90-1)
export const formatCadastur = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{6})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{6})\.(\d{2})(\d)/, '$1.$2.$3-$4');
};

// Salvar ou atualizar dados do guia turistico
export const saveGuideProfile = async (userId, guideData) => {
  const guideRef = doc(db, 'guides', userId);
  const rawCadastur = guideData.cadasturNumber ? guideData.cadasturNumber.replace(/\D/g, '') : '';

  const payload = {
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

// Buscar perfil do guia pelo UID do usuário
export const getGuideProfile = async (userId) => {
  const guideRef = doc(db, 'guides', userId);
  const snap = await getDoc(guideRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  return null;
};