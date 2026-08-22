import api from './api';

export const leaveService = {
  applyLeave: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/me'),
  getLeaveById: (id) => api.get(`/leaves/${id}`),
  updatePendingLeave: (id, data) => api.put(`/leaves/${id}`, data),
  withdrawPendingLeave: (id) => api.post(`/leaves/${id}/withdraw`),
  getAllLeaves: (status) => api.get('/admin/leaves', { params: { status } }),
  approveLeave: (id, data) => api.post(`/admin/leaves/${id}/approve`, data || {}),
  rejectLeave: (id, data) => api.post(`/admin/leaves/${id}/reject`, data || {})
};
