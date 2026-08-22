import api from './api';

export const profileService = {
  getMyProfile: () => api.get('/employees/me/profile'),
  updateMyProfile: (data) => api.put('/employees/me/profile', data),
  getMyDocuments: () => api.get('/employees/me/documents'),
  getAllEmployees: (department) => api.get('/admin/employees', { params: { department } }),
  getEmployeeById: (id) => api.get(`/admin/employees/${id}`),
  adminOverrideProfile: (id, data) => api.put(`/admin/employees/${id}`, data),
  getAuditLogs: () => api.get('/admin/audit-logs')
};
