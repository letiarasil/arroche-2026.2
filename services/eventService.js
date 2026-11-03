import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc,
  updateDoc, 
  addDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { resolveTrailImage } from './trailImages';

const EVENTS_COLLECTION = 'events';

/**
 * Normaliza os dados de um evento vindo do Firestore
 */
function normalizeEventData(id, data) {
  if (!data) return null;

  return {
    ...data,
    id,
    coverImage: resolveTrailImage(data.imageKey || data.coverImage || data.image),
    photos: (data.photos || []).map((photo) => ({
      ...photo,
      image: photo.imageKey ? resolveTrailImage(photo.imageKey) : (photo.image ? resolveTrailImage(photo.image) : null),
    })),
  };
}

/**
 * Busca todos os eventos cadastrados no Firestore
 */
export async function getEvents() {
  const colRef = collection(db, EVENTS_COLLECTION);
  const snap = await getDocs(colRef);
  return snap.docs.map((docSnap) => normalizeEventData(docSnap.id, docSnap.data()));
}

/**
 * Busca detalhes de um evento específico pelo ID
 */
export async function getEventById(eventId) {
  if (!eventId) return null;
  const docRef = doc(db, EVENTS_COLLECTION, eventId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return normalizeEventData(snap.id, snap.data());
  }
  return null;
}

/**
 * Realiza a inscrição de um usuário no evento
 */
export async function subscribeToEvent(eventId, ticketCount = 1, userDetails = {}) {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);

  // Registra a inscrição na subcoleção do evento
  const subscriptionsRef = collection(db, EVENTS_COLLECTION, eventId, 'subscriptions');
  await addDoc(subscriptionsRef, {
    userId: userDetails.id || userDetails.uid || 'anonymous',
    userName: userDetails.name || 'Aventureiro',
    userEmail: userDetails.email || '',
    spotsBooked: ticketCount,
    createdAt: serverTimestamp(),
  });

  // Atualiza a contagem de vagas restantes no evento
  await updateDoc(eventRef, {
    remainingSpots: increment(-ticketCount),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancela a participação no evento e devolve as vagas
 */
export async function cancelEventSubscription(eventId, ticketCount = 1) {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);

  await updateDoc(eventRef, {
    remainingSpots: increment(ticketCount),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Adiciona um comentário/pergunta no quadro do evento
 */
export async function addEventComment(eventId, comment) {
  const eventRef = doc(db, EVENTS_COLLECTION, eventId);
  const eventSnap = await getDoc(eventRef);

  if (eventSnap.exists()) {
    const currentComments = eventSnap.data().comments || [];
    const newEntry = {
      id: `c_${Date.now()}`,
      userName: comment.userName || 'Você',
      avatar: comment.avatar || null,
      text: comment.text,
      createdAt: comment.createdAt || 'Agora',
    };

    await updateDoc(eventRef, {
      comments: [...currentComments, newEntry],
      updatedAt: serverTimestamp(),
    });

    return newEntry;
  }
  return null;
}

