import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};
