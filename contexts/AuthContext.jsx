import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { createUserProfile, getUserProfile } from '../services/userService';
import { getGuideProfile, getStoredBankingInfo } from '../services/guideService';
import { mockDatabase } from '../constants/mockAuth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [guideProfile, setGuideProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistrationPending, setIsRegistrationPending] = useState(false);

  const registrationPendingRef = useRef(isRegistrationPending);
  useEffect(() => {
    registrationPendingRef.current = isRegistrationPending;
  }, [isRegistrationPending]);

  useEffect(() => {
    // Monitora a sessão do usuário no Firebase
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserProfile(null);
        setGuideProfile(null);

        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile || null);

          const isGuideRole = profile?.role === 'guide' || profile?.profileType === 'guia';
          if (isGuideRole) {
            try {
              let guideData = await getGuideProfile(currentUser.uid);
              const storedBanking = await getStoredBankingInfo(currentUser.uid);
              if (storedBanking) {
                guideData = {
                  ...(guideData || {}),
                  ...storedBanking,
                  hasCompletedBankingInfo: true,
                };
              }
              setGuideProfile(guideData || null);
            } catch (err) {
              console.warn('Erro ao carregar dados do guia:', err);
              setGuideProfile(null);
            }
          } else {
            setGuideProfile(null);
          }
        } catch (error) {
          console.warn('Não foi possível obter perfil do Firestore:', error?.message);
          setUserProfile(null);
          setGuideProfile(null);
        }

        // Se o usuário não estiver no meio do cadastro esperando clicar em "Entrar no app"
        if (!registrationPendingRef.current) {
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
  }, []);

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
      setGuideProfile(null);

      // Cria o perfil inicial na coleção 'users' do Firestore
      try {
        const profileData = await createUserProfile(currentUser.uid, {
          name,
          email,
          role,
          ...additionalData,
        });
        setUserProfile(profileData || {
          id: currentUser.uid,
          name,
          email,
          role,
          ...additionalData,
        });

        if (role === 'guide' || additionalData.profileType === 'guia') {
          try {
            const gData = await getGuideProfile(currentUser.uid);
            setGuideProfile(gData || null);
          } catch (_e) {
            setGuideProfile(null);
          }
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
    setUserProfile(null);
    setGuideProfile(null);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);

    try {
      const profile = await getUserProfile(userCredential.user.uid);
      setUserProfile(profile || null);

      const isGuideRole = profile?.role === 'guide' || profile?.profileType === 'guia';
      if (isGuideRole) {
        try {
          let guideData = await getGuideProfile(userCredential.user.uid);
          const storedBanking = await getStoredBankingInfo(userCredential.user.uid);
          if (storedBanking) {
            guideData = {
              ...(guideData || {}),
              ...storedBanking,
              hasCompletedBankingInfo: true,
            };
          }
          setGuideProfile(guideData || null);
        } catch (_e) {
          setGuideProfile(null);
        }
      } else {
        setGuideProfile(null);
      }
    } catch (_e) {
      setUserProfile(null);
      setGuideProfile(null);
    }

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
    } else if (explicitProfileType === 'trilheiro' || explicitProfileType === 'hiker') {
      setGuideProfile(null);
      setUserProfile((prev) => ({
        ...prev,
        role: 'hiker',
        profileType: 'trilheiro',
      }));
    }
    setIsLoggedIn(true);
  }, []);

  // Função login universal (compatível com chamadas mock e autenticação direta)
  const login = useCallback((mockUser = null) => {
    setIsRegistrationPending(false);
    if (mockUser) {
      setUser(mockUser);
    }
    setIsLoggedIn(true);
  }, []);

  // Função para fazer logout
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e?.message);
    }
    if (mockDatabase) {
      mockDatabase.registeredUser = null;
    }
    setUser(null);
    setUserProfile(null);
    setGuideProfile(null);
    setIsLoggedIn(false);
    setIsRegistrationPending(false);
  };

  const logout = logOut;

  // Atualiza em memória o perfil do guia (ex: dados bancários e Cadastur)
  const updateGuideProfile = useCallback((newData) => {
    setGuideProfile((prev) => ({
      ...(prev || {}),
      ...newData,
      hasCompletedBankingInfo: true,
    }));
  }, []);

  const isGuide = Boolean(
    user &&
    (userProfile?.role === 'guide' ||
      userProfile?.profileType === 'guia' ||
      user?.profileType === 'guia' ||
      user?.role === 'guide' ||
      Boolean(guideProfile && Object.keys(guideProfile).length > 0))
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
        updateGuideProfile,
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