import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVnU3gpmunZJBRoYUENJbtMhx0K4CGx5U",
  authDomain: "arroche.firebaseapp.com",
  projectId: "arroche",
  storageBucket: "arroche.firebasestorage.app",
  messagingSenderId: "383563205568",
  appId: "1:383563205568:web:76b1dd7cac6800de50d625",
};

// 1. Inicializa o aplicativo Firebase de forma segura
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 2. Inicializa o Auth
const auth = getAuth(app);

// 3. Inicializa a instância do Firestore
const db = getFirestore(app);

export { app, auth, db };
