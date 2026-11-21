// API client for Alzikrayat - all REST calls live here

import axios from 'axios';
import { getStoredUser } from './storage';

const api = axios.create({ baseURL: '/api' });

// Identify the logged-in user to the server (the server re-loads the user from MongoDB)
api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user?._id) config.headers['x-user-id'] = user._id;
  return config;
});

// Turn any axios error into a readable message for the UI
export const getErrorMessage = (err, fallback = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.') => {
  if (!err.response) return 'تعذر الاتصال بالخادم. تحقق من اتصالك وحاول مرة أخرى.';
  const { message, errors } = err.response.data || {};
  if (Array.isArray(errors) && errors.length) return errors.join(' ');
  return message || fallback;
};

export const imageUrl = (fileName) => `/uploads/${fileName}`;

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
};

export const photoAPI = {
  getAll: (params) => api.get('/photos', { params }),
  getStats: () => api.get('/photos/stats'),
  getOne: (id) => api.get(`/photos/${id}`),
  // axios sets the multipart boundary automatically for FormData
  create: (formData) => api.post('/photos', formData),
  remove: (id) => api.delete(`/photos/${id}`),
  getComments: (id) => api.get(`/photos/${id}/comments`),
  addComment: (id, comment) => api.post(`/photos/${id}/comments`, { comment }),
  removeComment: (id, commentId) => api.delete(`/photos/${id}/comments/${commentId}`),
};

export default api;
