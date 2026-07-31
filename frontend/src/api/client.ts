import axios from 'axios';

// Creamos una instancia configurada de Axios
export const apiClient = axios.create({
  baseURL: 'http://localhost:4000', // URL de nuestro backend NestJS (que corre en el puerto 4000)
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
