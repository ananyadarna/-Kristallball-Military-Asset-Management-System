import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, [token]);

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
