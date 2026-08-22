import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  User,
  Clock,
  Calendar,
  CalendarDays,
  CreditCard,
  Bell,
  Users,
  AlertOctagon,
  FileBarChart,
  LogOut,
  Layers,
  ArrowRightLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isHRAdmin, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Layers size={22} />
        </div>
        <div>
          <span className="brand-name">DAYFLOW</span>
          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', fontWeight: 600 }}>HRMS ENTERPRISE</div>
        </div>
      </div>

      <div className="sidebar-nav">
        {isHRAdmin() ? (
          <>
            <div className="nav-section-header">HR Admin Console</div>
            <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>Admin Dashboard</span>
            </NavLink>
            <NavLink to="/admin/employees" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Users size={18} />
              <span>Employee Directory</span>
            </NavLink>
            <NavLink to="/admin/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} />
              <span>Company Attendance</span>
            </NavLink>
            <NavLink to="/admin/leave" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarDays size={18} />
              <span>Leave Approvals</span>
            </NavLink>
            <NavLink to="/admin/early-return" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ArrowRightLeft size={18} />
              <span>Early Return Requests</span>
            </NavLink>
            <NavLink to="/admin/payroll" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>Payroll Management</span>
            </NavLink>
            <NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileBarChart size={18} />
              <span>Reports & Analytics</span>
            </NavLink>
            <NavLink to="/admin/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} />
              <span>System Alerts</span>
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-section-header">Employee Self-Service</div>
            <NavLink to="/employee/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={18} />
              <span>My Dashboard</span>
            </NavLink>
            <NavLink to="/employee/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <User size={18} />
              <span>My Profile</span>
            </NavLink>
            <NavLink to="/employee/attendance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Clock size={18} />
              <span>Attendance & Clock</span>
            </NavLink>
            <NavLink to="/employee/calendar" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Calendar size={18} />
              <span>Personal Calendar</span>
            </NavLink>
            <NavLink to="/employee/leave" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CalendarDays size={18} />
              <span>Leave Requests</span>
            </NavLink>
            <NavLink to="/employee/payroll" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <CreditCard size={18} />
              <span>Salary & Payslips</span>
            </NavLink>
            <NavLink to="/employee/notifications" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Bell size={18} />
              <span>Notifications</span>
            </NavLink>
          </>
        )}
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.875rem'
            }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'white' }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)' }}>
              {user?.employeeId}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--slate-400)',
            cursor: 'pointer',
            padding: '0.375rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex'
          }}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
