import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types/api';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('flight_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('flight_token');
      sessionStorage.removeItem('flight_user');
      if (window.location.pathname !== '/login') {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;