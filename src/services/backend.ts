import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { BASE_URL } from '../config/apiConfig';

export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
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

API.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const response = error.response;
    let errorMessage = error.message;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your network connection.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (response) {
      if (response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        (error as any).isAuthError = true;
        useAuthStore.getState().logout();
      } else if (response.data) {
        const data = response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.detail) {
          if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail) && data.detail.length > 0) {
            errorMessage = data.detail
              .map((d: any) => d.msg || JSON.stringify(d))
              .join(', ');
          } else if (typeof data.detail === 'object') {
            errorMessage = data.detail.message || JSON.stringify(data.detail);
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
      }
    }

    error.message = errorMessage;

    return Promise.reject(error);
  },
);
