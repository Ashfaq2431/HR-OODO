import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Route Guards
import { EmployeeRoute } from './EmployeeRoute';
import { AdminRoute } from './AdminRoute';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { VerifyEmail } from '../pages/auth/VerifyEmail';

// Employee Pages
import { EmployeeDashboard } from '../pages/employee/EmployeeDashboard';
import { EmployeeProfile } from '../pages/employee/EmployeeProfile';
import { EmployeeAttendance } from '../pages/employee/EmployeeAttendance';
import { EmployeeCalendar } from '../pages/employee/EmployeeCalendar';
import { EmployeeLeave } from '../pages/employee/EmployeeLeave';
import { ApplyLeavePage } from '../pages/employee/ApplyLeavePage';
import { EmployeePayroll } from '../pages/employee/EmployeePayroll';
import { EmployeePayslip } from '../pages/employee/EmployeePayslip';
import { EmployeeNotifications } from '../pages/employee/EmployeeNotifications';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminEmployees } from '../pages/admin/AdminEmployees';
import { AdminEmployeeDetail } from '../pages/admin/AdminEmployeeDetail';
import { AdminAttendance } from '../pages/admin/AdminAttendance';
import { AdminAttendanceExceptions } from '../pages/admin/AdminAttendanceExceptions';
import { AdminLeave } from '../pages/admin/AdminLeave';
import { AdminLeaveDetail } from '../pages/admin/AdminLeaveDetail';
import { AdminEarlyReturn } from '../pages/admin/AdminEarlyReturn';
import { AdminPayroll } from '../pages/admin/AdminPayroll';
import { AdminPayrollMonth } from '../pages/admin/AdminPayrollMonth';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminNotifications } from '../pages/admin/AdminNotifications';
import { AdminSettings } from '../pages/admin/AdminSettings';

export const AppRoutes = () => {
  const { user, isHRAdmin } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={isHRAdmin() ? '/admin/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Protected Employee Routes */}
      <Route element={<EmployeeRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/calendar" element={<EmployeeCalendar />} />
          <Route path="/employee/leave" element={<EmployeeLeave />} />
          <Route path="/employee/leave/apply" element={<ApplyLeavePage />} />
          <Route path="/employee/payroll" element={<EmployeePayroll />} />
          <Route path="/employee/payslip/:month" element={<EmployeePayslip />} />
          <Route path="/employee/notifications" element={<EmployeeNotifications />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<AdminRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/employees/:employeeId" element={<AdminEmployeeDetail />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/attendance/exceptions" element={<AdminAttendanceExceptions />} />
          <Route path="/admin/leave" element={<AdminLeave />} />
          <Route path="/admin/leave/:requestId" element={<AdminLeaveDetail />} />
          <Route path="/admin/early-return" element={<AdminEarlyReturn />} />
          <Route path="/admin/payroll" element={<AdminPayroll />} />
          <Route path="/admin/payroll/:month" element={<AdminPayrollMonth />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
