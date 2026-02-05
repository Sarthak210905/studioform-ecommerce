import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

// Sleep utility
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Create axios instance WITHOUT /api prefix
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add retry count to config
    if (!config.headers['x-retry-count']) {
      config.headers['x-retry-count'] = '0';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retry logic
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: number };
    
    // Get current retry count
    const retryCount = parseInt(config.headers?.['x-retry-count'] as string || '0');
    
    // Check if we should retry
    const shouldRetry = 
      config && 
      retryCount < MAX_RETRIES &&
      error.response &&
      RETRY_STATUS_CODES.includes(error.response.status);
    
    if (shouldRetry) {
      // Increment retry count
      config.headers['x-retry-count'] = String(retryCount + 1);
      
      // Calculate delay with exponential backoff
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      
      console.log(`Retrying request (${retryCount + 1}/${MAX_RETRIES}) after ${delay}ms...`);
      
      // Wait before retrying
      await sleep(delay);
      
      // Retry the request
      return api(config);
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Define public routes that don't require authentication
      const publicRoutes = [
        '/',
        '/products',
        '/about',
        '/contact',
        '/faq',
        '/privacy',
        '/terms',
        '/refund',
        '/shipping',
        '/login',
        '/register',
      ];
      
      const currentPath = window.location.pathname;
      
      // Check if current path is a public route or product detail page
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || 
        currentPath.startsWith('/products/') ||
        currentPath.startsWith('/auth/')
      );
      
      // Only clear auth and redirect if NOT on a public route
      if (!isPublicRoute) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      // For public routes, just log the error but don't redirect
      console.log('Authentication required for this feature');
    }
    
    // Handle network errors
    if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
      console.error('Network error:', error.message);
      // You could show a toast here for network errors
    }
    
    return Promise.reject(error);
  }
);

export default api;
