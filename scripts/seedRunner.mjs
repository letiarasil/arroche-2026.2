import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { SEED_TRAILS, SEED_GUIDES, SEED_EVENTS } from '../services/seedDatabase.js';

const firebaseConfig = {
  apiKey: "AIzaSyCVnU3gpmunZJBRoYUENJbtMhx0K4CGx5U",
  authDomain: "arroche.firebaseapp.com",
  projectId: "arroche",
  storageBucket: "arroche.firebasestorage.app",
  messagingSenderId: "383563205568",
  appId: "1:383563205568:web:76b1dd7cac6800de50d625",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function authenticate() {
  const email = 'admin@arroche.com';
  const password = 'Admin123@#';
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    console.log('[Auth] Autenticado com sucesso como admin:', cred.user.uid);
    return cred.user;
  } catch (err) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Auth] Usuário admin criado e autenticado:', cred.user.uid);
      return cred.user;
    } catch (createErr) {
      console.error('[Auth] Erro ao autenticar no Firebase:', createErr.message);
      throw createErr;
    }
  }
}

async function runSeed() {
  console.log('Iniciando sincronização dos dados com o Firebase Firestore...\n');

  await authenticate();

  console.log('\n--- 1. Enviando Trilhas (coleção: "trails") ---');
  for (const trail of SEED_TRAILS) {
    const ref = doc(db, 'trails', trail.id);
    await setDoc(ref, {
      ...trail,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[OK] Trilha gravada: ${trail.id} - ${trail.title}`);
  }

  console.log('\n--- 2. Enviando Guias (coleção: "guides") ---');
  for (const guide of SEED_GUIDES) {
    const ref = doc(db, 'guides', guide.id);
    await setDoc(ref, {
      ...guide,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[OK] Guia gravado: ${guide.id} - ${guide.displayName || guide.name}`);
  }

  console.log('\n--- 3. Enviando Eventos de Trilha (coleção: "events") ---');
  for (const event of SEED_EVENTS) {
    const ref = doc(db, 'events', event.id);
    await setDoc(ref, {
      ...event,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log(`[OK] Evento gravado: ${event.id} - ${event.title}`);
  }

  console.log('\n======================================================');
  console.log('SUCESSO TOTAL: TODOS OS DADOS FORAM ENVIADOS AO FIRESTORE!');
  console.log('======================================================');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('\n[ERRO FATAL]:', err);
  process.exit(1);
});
