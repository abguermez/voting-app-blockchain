import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  const login = (username, password) => {
    // In a real app, you'd validate against a backend
    if (username === 'admin' && password === 'admin123') {
      setUser({ username, role: 'admin' });
      return true;
    } else if (username === '1' && password === '1') {
      setUser({ username, role: 'user' });
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);