import React, { createContext, useState, useContext } from 'react';
import { mockDatabase } from '../constants/mockAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(
    mockDatabase.registeredUser || mockDatabase.defaultUser
  );

  const login = (customUser) => {
    if (customUser) {
      setUser(customUser);
    } else {
      setUser(mockDatabase.registeredUser || mockDatabase.defaultUser);
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
