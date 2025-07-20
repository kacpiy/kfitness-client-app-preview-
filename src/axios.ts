import axios from 'axios';
import { useUserStore } from './stores/userStore';
import router from './router/router';
import { useNotificationStore } from './stores/notificationStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
  timeout: 10000,
});

// Interceptor dla żądań - dodawanie accessToken do nagłówków
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;