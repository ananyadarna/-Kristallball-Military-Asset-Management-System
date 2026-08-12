import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // Synchronous init means no initial load state needed

  const loginUser = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: jwtToken, user: userData } = response.data;

    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(jwtToken);
    setUser(userData);
    return userData;
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginUser, logout: logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
