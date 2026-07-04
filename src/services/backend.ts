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
    console.log(
      `[OTP Login Flow] Axios request start: [${config.method?.toUpperCase()}] ${config.baseURL || ''}${config.url}\n` +
        `Headers: ${JSON.stringify(config.headers)}\n` +
        `Data: ${JSON.stringify(config.data || {})}`,
    );
    return config;
  },
  error => {
    console.error(
      '[OTP Login Flow] Axios request setup error:',
      error?.message || error,
      'Stack:',
      error?.stack,
    );
    return Promise.reject(error);
  },
);

API.interceptors.response.use(
  response => {
    console.log(
      `[OTP Login Flow] Axios request end: SUCCESS [${response.config.method?.toUpperCase()}] ${response.config.url}\n` +
        `HTTP Status: ${response.status}\n` +
        `Response Headers: ${JSON.stringify(response.headers)}\n` +
        `Response Body: ${JSON.stringify(response.data)}`,
    );
    return response;
  },
  error => {
    const response = error.response;
    let errorMessage = error.message;

    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your network connection.';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (response && response.data) {
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

    error.message = errorMessage;

    console.error(
      `[OTP Login Flow] Axios Error: ${errorMessage}\n` +
        `HTTP Status: ${response ? response.status : 'N/A'}\n` +
        `Response Headers: ${response ? JSON.stringify(response.headers) : 'N/A'}\n` +
        `Response Body: ${response ? JSON.stringify(response.data) : 'N/A'}\n` +
        `Stack Trace: ${error.stack || 'N/A'}`,
    );
    return Promise.reject(error);
  },
);
