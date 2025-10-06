import { createContext, useContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  const api = axios.create({
    baseURL: (import.meta.env.VITE_API_BASE || 'http://localhost:5000') + '/api'
  });

  // attach token dynamically
  api.interceptors.request.use((config) => {
    const t = token || localStorage.getItem('token');
    if (t) {
      config.headers.Authorization = `Bearer ${t}`;
      // Only set Content-Type if it's not already set (preserves multipart/form-data)
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    return config;
  }, (err) => {
    console.error('API Request Error:', err);
    return Promise.reject(err);
  });

  const signup = async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const login = async (data) => {
    const res = await api.post('/auth/login', data);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const updateProfile = (newData) => {
    console.log('Updating profile with:', newData);

    const updatedUser = {
      ...user,
      ...newData,
      name: newData.name || user?.name || '',
      email: newData.email || user?.email || '',
      phone: newData.phone !== undefined ? newData.phone : user?.phone || '',
      gender: newData.gender !== undefined ? newData.gender : user?.gender || '',
      address: newData.address !== undefined ? newData.address : user?.address || '',
      birthday: newData.birthday !== undefined ? newData.birthday : user?.birthday,
      image: newData.image || user?.image || ''
    };

    console.log('Setting user state to:', updatedUser);

    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, token, signup, login, logout, updateProfile, api }}>
      {children}
    </AuthContext.Provider>
  );
};