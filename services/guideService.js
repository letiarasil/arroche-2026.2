import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { 
  collection,
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages';

const GUIDES_COLLECTION = 'guides';

export const formatCadastur = (value) => {
  if (!value) return '';
  const clean = String(value).replace(/\D/g, '').slice(0, 11);
  return clean
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{6})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{6})\.(\d{2})(\d)/, '$1.$2.$3-$4');
};

function normalizeGuideData(id, data) {
  if (!data) return null;

  const cleanCadastur = data.cadasturNumber ? String(data.cadasturNumber).replace(/\D/g, '') : '';
  const hasBanking = Boolean(
    cleanCadastur.length === 11 &&
    data.bank &&
    data.agency &&
    data.account
  );

  return {
    ...data,
    id,
    cadasturNumber: cleanCadastur,
    cadasturFormatted: formatCadastur(cleanCadastur),
    hasCompletedBankingInfo: hasBanking,
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
 * Busca todos os guias cadastrados no Firestore (coleção 'guides' e coleção 'users')
 */
export const getAllGuides = async () => {
  const guidesMap = new Map();

  // 1. Busca todos os documentos da coleção 'guides'
  try {
    const colRef = collection(db, GUIDES_COLLECTION);
    const snap = await getDocs(colRef);
    snap.docs.forEach((docSnap) => {
      const normalized = normalizeGuideData(docSnap.id, docSnap.data());
      if (normalized) {
        guidesMap.set(docSnap.id, normalized);
      }
    });
  } catch (err) {
    console.warn('Aviso ao buscar coleção guides do Firestore:', err?.message);
  }

  // 2. Busca também os usuários cadastrados como guia na coleção 'users'
  try {
    const usersRef = collection(db, 'users');
    const [snapRole, snapProfileType] = await Promise.all([
      getDocs(query(usersRef, where('role', '==', 'guide'))).catch(() => ({ docs: [] })),
      getDocs(query(usersRef, where('profileType', '==', 'guia'))).catch(() => ({ docs: [] })),
    ]);

    const allGuideDocs = [...snapRole.docs, ...snapProfileType.docs];

    allGuideDocs.forEach((uDoc) => {
      const uData = uDoc.data();
      const existing = guidesMap.get(uDoc.id);

      if (!existing) {
        const newGuide = normalizeGuideData(uDoc.id, {
          name: uData.name || 'Guia',
          displayName: uData.name || 'Guia',
          role: 'Guia Profissional',
          specialties: uData.specialties || 'Trilhas • Ecoturismo • Aventura',
          bio: uData.bio || '',
          avatar: uData.avatarUrl || uData.avatar || null,
          trailsCount: uData.trailsCount || 0,
          ratingAverage: uData.ratingAverage || 5.0,
        });
        guidesMap.set(uDoc.id, newGuide);
      } else {
        if (!existing.avatar && (uData.avatarUrl || uData.avatar)) {
          existing.avatar = uData.avatarUrl || uData.avatar;
        }
        if (!existing.name && uData.name) {
          existing.name = uData.name;
          existing.displayName = uData.name;
        }
      }
    });
  } catch (err) {
    console.warn('Aviso ao buscar usuários com papel de guia:', err?.message);
  }

  return Array.from(guidesMap.values());
};

/**
 * Buscar perfil do guia pelo UID do usuário ou ID do documento.
 * Sincroniza ou limpa o cache local conforme o estado real no Firestore.
 */
export const getGuideProfile = async (userId) => {
  if (!userId) return null;

  try {
    const guideRef = doc(db, GUIDES_COLLECTION, userId);
    const snap = await getDoc(guideRef);

    if (snap.exists()) {
      const normalized = normalizeGuideData(snap.id, snap.data());

      // Sincroniza o cache local com os dados reais do Firestore
      if (normalized.hasCompletedBankingInfo) {
        await setStoredBankingInfo(userId, {
          cadasturNumber: normalized.cadasturNumber,
          cadasturFormatted: normalized.cadasturFormatted,
          bank: normalized.bank || '',
          agency: normalized.agency || '',
          account: normalized.account || '',
          accountType: normalized.accountType || 'corrente',
          hasCompletedBankingInfo: true,
        });
      } else {
        await clearStoredBankingInfo(userId);
      }

      return normalized;
    }

    // Se o documento não existe no Firestore (ex: foi apagado), limpa o cache local
    await clearStoredBankingInfo(userId);
  } catch (err) {
    console.warn('Erro ao buscar perfil do guia no Firestore:', err?.message);
    // Apenas em caso de falha de rede/offline, tenta recuperar dados salvos localmente
    const cached = await getStoredBankingInfo(userId);
    if (cached) {
      return normalizeGuideData(userId, cached);
    }
  }

  // Fallback para exibição visual de perfil caso o documento ainda não exista em 'guides'
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
        hasCompletedBankingInfo: false,
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
  const rawCadastur = guideData.cadasturNumber
    ? String(guideData.cadasturNumber).replace(/\D/g, '').slice(0, 11)
    : '';

  const hasCompleteInfo = Boolean(
    rawCadastur.length === 11 &&
    guideData.bank &&
    guideData.agency &&
    guideData.account
  );

  const payload = {
    ...guideData,
    cadasturNumber: rawCadastur,
    cadasturFormatted: formatCadastur(rawCadastur),
    bank: guideData.bank || '',
    agency: guideData.agency || '',
    account: guideData.account || '',
    accountType: guideData.accountType || 'corrente',
    hasCompletedBankingInfo: hasCompleteInfo,
    isVerified: guideData.isVerified || false,
    phone: guideData.phone || '',
    operatingCities: guideData.operatingCities || [],
    bio: guideData.bio || '',
    ratingAverage: guideData.ratingAverage || 0,
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(guideRef, payload, { merge: true });
  } catch (err) {
    console.warn('Erro ao salvar guia no Firestore (persistindo em cache):', err?.message);
  }

  if (hasCompleteInfo) {
    await setStoredBankingInfo(userId, {
      cadasturNumber: rawCadastur,
      cadasturFormatted: formatCadastur(rawCadastur),
      bank: guideData.bank || '',
      agency: guideData.agency || '',
      account: guideData.account || '',
      accountType: guideData.accountType || 'corrente',
      hasCompletedBankingInfo: true,
    });
  } else {
    await clearStoredBankingInfo(userId);
  }

  return { id: userId, ...payload };
};

/**
 * Persistência local no AsyncStorage para dados bancários e Cadastur do guia
 */
export const getStoredBankingInfo = async (userId) => {
  if (!userId) return null;
  try {
    const raw = await AsyncStorage.getItem(`@arroche_guide_banking_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao ler dados bancários do AsyncStorage:', e);
  }
  return null;
};

export const setStoredBankingInfo = async (userId, data) => {
  if (!userId) return;
  try {
    await AsyncStorage.setItem(
      `@arroche_guide_banking_${userId}`,
      JSON.stringify(data)
    );
  } catch (e) {
    console.warn('Erro ao salvar dados bancários no AsyncStorage:', e);
  }
};

export const clearStoredBankingInfo = async (userId) => {
  if (!userId) return;
  try {
    await AsyncStorage.removeItem(`@arroche_guide_banking_${userId}`);
  } catch (e) {
    console.warn('Erro ao limpar dados bancários do AsyncStorage:', e);
  }
};

/**
 * Verifica no Firestore (com fallback offline) se o guia já preencheu os dados bancários e Cadastur
 */
export const checkGuideHasBankingInfo = async (userId, currentGuideProfile = null) => {
  if (!userId) {
    return Boolean(
      currentGuideProfile?.hasCompletedBankingInfo ||
      (currentGuideProfile?.cadasturNumber?.length === 11 &&
        currentGuideProfile?.bank &&
        currentGuideProfile?.agency &&
        currentGuideProfile?.account)
    );
  }

  try {
    const freshProfile = await getGuideProfile(userId);
    return Boolean(freshProfile?.hasCompletedBankingInfo);
  } catch (_err) {
    const stored = await getStoredBankingInfo(userId);
    return Boolean(
      stored?.hasCompletedBankingInfo &&
      stored?.cadasturNumber?.length === 11 &&
      stored?.bank &&
      stored?.agency &&
      stored?.account
    );
  }
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