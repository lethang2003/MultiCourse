import React, { createContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('authToken') || null,
    role: localStorage.getItem('role') || 'Student',
  });

  const updateAuth = (token, role) => {
    if (token && role) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
    }
    setAuth({ token, role });
  };

  return (
    <AuthContext.Provider value={{ auth, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
