import api from './api';

export const reportService = {
  getAttendanceCompliance: () => api.get('/admin/reports/attendance-compliance'),
  getLeaveSummary: () => api.get('/admin/reports/leave-summary'),
  getPayrollSummary: (month) => api.get('/admin/reports/payroll-summary', { params: { month } }),
  getSalarySlipReport: (userId, month) => api.get('/admin/reports/salary-slip', { params: { userId, month } })
};
