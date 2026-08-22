import api from './api';

export const payrollService = {
  getMyPayroll: () => api.get('/payroll/me'),
  getMyPayslip: (month) => api.get(`/payroll/me/${month}/payslip`),
  getGlobalPayroll: (month) => api.get('/admin/payroll', { params: { month } }),
  runMonthlyPayroll: (data) => api.post('/admin/payroll/run', data),
  recalculatePayroll: (userId, month) => api.post(`/admin/payroll/recalculate/${userId}/${month}`),
  getSalaryStructure: (userId) => api.get(`/admin/payroll/salary/${userId}`),
  updateSalaryStructure: (userId, data) => api.put(`/admin/payroll/salary/${userId}`, data),
  getEmployeePayslip: (userId, month) => api.get(`/admin/payroll/payslip/${userId}/${month}`)
};
