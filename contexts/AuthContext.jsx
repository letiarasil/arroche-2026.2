import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monitora a sessão do usuário em tempo real
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Carrega os dados adicionais do usuário do Firestore
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Função para cadastrar novo usuário no Firebase Auth + Firestore
  const signUp = async (email, password, name, role = 'hiker') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // Cria o perfil inicial na coleção 'users'
    const profileData = await createUserProfile(uid, {
      name,
      email,
      role,
    });

    setUserProfile(profileData);
    return userCredential.user;
  };

  // Função para realizar login
  const signIn = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Função para fazer logout
  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        userProfile,
        loading,
        signUp,
        signIn,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para usar o contexto de forma simplificada nos componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}