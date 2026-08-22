import api from './api';

export const attendanceService = {
  checkIn: (data) => api.post('/attendance/check-in', data || {}),
  checkOut: (data) => api.post('/attendance/check-out', data || {}),
  getTodaySummary: () => api.get('/attendance/me/today'),
  getMyAttendance: () => api.get('/attendance/me'),
  getMyCalendar: (year, month) => api.get('/attendance/me/calendar', { params: { year, month } }),
  getGlobalAttendance: (params) => api.get('/admin/attendance', { params }),
  manualOverride: (data) => api.post('/admin/attendance/override', data)
};
