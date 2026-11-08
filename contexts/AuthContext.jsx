import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';
import { getGuideProfile } from '../services/guideService';
import { mockDatabase } from '../constants/mockAuth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [guideProfile, setGuideProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistrationPending, setIsRegistrationPending] = useState(false);

  useEffect(() => {
    // Monitora a sessão do usuário no Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
          if (profile?.role === 'guide' || profile?.profileType === 'guia') {
            try {
              const guideData = await getGuideProfile(currentUser.uid);
              setGuideProfile(guideData);
            } catch (err) {
              console.warn('Erro ao carregar dados do guia:', err);
            }
          }
        } catch (error) {
          console.warn('Não foi possível obter perfil do Firestore:', error?.message);
        }

        // Se o usuário não estiver no meio do cadastro esperando clicar em "Entrar no app"
        if (!isRegistrationPending) {
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setGuideProfile(null);
        setIsLoggedIn(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isRegistrationPending]);

  // Inicia o fluxo de cadastro e impede redirecionamento antecipado
  const startRegistration = useCallback(() => {
    setIsRegistrationPending(true);
  }, []);

  // Cadastra novo usuário no Firebase Auth + Firestore
  const signUp = async (email, password, name, role = 'hiker', additionalData = {}) => {
    setIsRegistrationPending(true);
    let currentUser = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      currentUser = userCredential.user;
      setUser(currentUser);

      // Cria o perfil inicial na coleção 'users' do Firestore
      try {
        const profileData = await createUserProfile(currentUser.uid, {
          name,
          email,
          role,
          ...additionalData,
        });
        setUserProfile(profileData);
        if (role === 'guide' || additionalData.profileType === 'guia') {
          const gData = await getGuideProfile(currentUser.uid);
          setGuideProfile(gData);
        }
      } catch (firestoreError) {
        console.warn('Erro ao salvar perfil no Firestore:', firestoreError?.message);
        const fallbackProfile = {
          id: currentUser.uid,
          name,
          email,
          role,
          ...additionalData,
        };
        setUserProfile(fallbackProfile);
      }

      // Salva também no mockDatabase para fallback consistente
      mockDatabase.registeredUser = {
        email,
        password,
        name,
        role,
        ...additionalData,
      };

      return currentUser;
    } catch (authError) {
      console.warn('Erro na criação de usuário no Firebase Auth:', authError?.message);
      // Salva no mockDatabase como fallback
      mockDatabase.registeredUser = {
        email,
        password,
        name,
        role,
        ...additionalData,
      };
      throw authError;
    }
  };

  // Realiza login no Firebase Auth
  const signIn = async (email, password) => {
    setIsRegistrationPending(false);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    try {
      const profile = await getUserProfile(userCredential.user.uid);
      setUserProfile(profile);
      if (profile?.role === 'guide' || profile?.profileType === 'guia') {
        const guideData = await getGuideProfile(userCredential.user.uid);
        setGuideProfile(guideData);
      }
    } catch (_e) {}
    setIsLoggedIn(true);
    return userCredential.user;
  };

  // Conclui o cadastro a partir da tela AccountCreated ("Entrar no app")
  const enterApp = useCallback((explicitProfileType = null) => {
    setIsRegistrationPending(false);
    if (explicitProfileType === 'guia') {
      setUserProfile((prev) => ({
        ...prev,
        role: 'guide',
        profileType: 'guia',
      }));
    }
    setIsLoggedIn(true);
  }, []);

  // Função login universal (compatível com chamadas mock e autenticação direta)
  const login = useCallback((mockUser = null) => {
    setIsRegistrationPending(false);
    setIsLoggedIn(true);
    if (mockUser) {
      setUser(mockUser);
    }
  }, []);

  // Função para fazer logout
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e?.message);
    }
    setUser(null);
    setUserProfile(null);
    setGuideProfile(null);
    setIsLoggedIn(false);
    setIsRegistrationPending(false);
  };

  const logout = logOut;

  const isGuide = Boolean(
    userProfile?.role === 'guide' ||
    userProfile?.profileType === 'guia' ||
    guideProfile !== null ||
    mockDatabase.registeredUser?.profileType === 'guia'
  );

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        signed: isLoggedIn,
        isGuide,
        user,
        userProfile,
        guideProfile,
        loading,
        signUp,
        signIn,
        login,
        enterApp,
        startRegistration,
        logOut,
        logout,
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
