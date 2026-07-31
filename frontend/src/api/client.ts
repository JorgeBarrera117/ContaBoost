import axios from 'axios';

// Creamos una instancia configurada de Axios
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000', // API_URL de prod o localhost
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
