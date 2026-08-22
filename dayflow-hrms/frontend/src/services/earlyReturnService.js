import api from './api';

export const earlyReturnService = {
  submitEarlyReturn: (data) => api.post('/early-return', data),
  getMyEarlyReturns: () => api.get('/early-return/me'),
  getAllEarlyReturns: (status) => api.get('/admin/early-return', { params: { status } }),
  approveEarlyReturn: (id, data) => api.post(`/admin/early-return/${id}/approve`, data || {}),
  rejectEarlyReturn: (id, data) => api.post(`/admin/early-return/${id}/reject`, data || {})
};
