// src/services/api.ts
import axios from 'axios';
import useAuthStore from '@/store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the token
api.interceptors.request.use(
  (config) => {
    // We grab the token directly from Zustand state
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401s globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If the backend says the token is invalid/expired, log them out immediately
      useAuthStore.getState().logout();
      // Optional: redirect to login page if outside of React Router context
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;