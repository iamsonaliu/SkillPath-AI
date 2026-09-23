import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for API errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorPayload = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      errors: error.response?.data?.errors || [],
      status: error.response?.status,
    };
    return Promise.reject(errorPayload);
  }
);

export const roadmapAPI = {
  generate: (payload) => api.post('/roadmaps/generate', payload),
  getById: (id) => api.get(`/roadmaps/${id}`),
};

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
