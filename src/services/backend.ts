import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const API = axios.create({
  baseURL: 'http://192.168.31.2:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use(
  config => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);
