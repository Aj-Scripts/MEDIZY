import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:5000/api',
  // withCredentials: true, // enable if using cookies
});

// attach token automatically
API.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('medizy_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) config.headers.Authorization = `Bearer ${parsed.token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

export default API;
