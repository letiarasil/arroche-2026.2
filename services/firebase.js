import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeAuth, 
  getReactNativePersistence, 
  getAuth 
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCVnU3gpmunZJBRoYUENJbtMhx0K4CGx5U",
  authDomain: "arroche.firebaseapp.com",
  projectId: "arroche",
  storageBucket: "arroche.firebasestorage.app",
  messagingSenderId: "383563205568",
  appId: "1:383563205568:web:76b1dd7cac6800de50d625",
};

// Evita inicializar o app múltiplas vezes no React Native (Fast Refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Configura a autenticação com suporte a persistência via AsyncStorage
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  // Caso o auth já tenha sido inicializado anteriormente pelo Fast Refresh
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
