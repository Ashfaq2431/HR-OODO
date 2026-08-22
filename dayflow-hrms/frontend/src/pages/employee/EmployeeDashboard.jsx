import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import { leaveService } from '../../services/leaveService';
import { payrollService } from '../../services/payrollService';
import { notificationService } from '../../services/notificationService';
import { CheckInOutCard } from '../../components/attendance/CheckInOutCard';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  CreditCard,
  Bell,
  User,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [profRes, leaveRes, payRes, notifRes] = await Promise.all([
        profileService.getMyProfile(),
        leaveService.getMyLeaves(),
        payrollService.getMyPayroll(),
        notificationService.getMyNotifications()
      ]);

      if (profRes.success) setProfile(profRes.data);
      if (leaveRes.success) setLeaves(leaveRes.data);
      if (payRes.success) setPayroll(payRes.data);
      if (notifRes.success) setNotifications(notifRes.data.slice(0, 5));
    } catch (e) {
      console.error('Failed to load employee dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');
  const latestPayroll = payroll[0];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">
            Welcome back, {profile?.firstName || user?.firstName}!
          </h1>
          <p className="page-subtitle">
            {profile?.designation} • {profile?.department} (ID: {user?.employeeId})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/employee/leave/apply')}>
            <CalendarDays size={16} />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Grid */}
      <div className="stat-grid">
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves.length}
          icon={CalendarDays}
          color="warning"
          subtext="Awaiting HR review"
        />
        <StatCard
          label="Gross Salary"
          value={formatCurrency(profile?.grossPay)}
          icon={CreditCard}
          color="success"
          subtext={`Basic: ${formatCurrency(profile?.basicPay)}`}
        />
        <StatCard
          label="Employment"
          value={profile?.employmentType || 'FULL_TIME'}
          icon={User}
          color="primary"
          subtext={`Since ${formatDate(profile?.joiningDate)}`}
        />
        <StatCard
          label="Latest Net Pay"
          value={latestPayroll ? formatCurrency(latestPayroll.totalFinalSalary) : '—'}
          icon={TrendingUp}
          color="purple"
          subtext={latestPayroll ? `For ${latestPayroll.billingMonth}` : 'No slips yet'}
        />
      </div>

      {/* Main Grid: Clocking Card + Pending Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <CheckInOutCard onStatusChange={loadDashboardData} />
        </div>

        {/* Quick Access Actions & Notifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Access Card */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>Quick Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/employee/profile')} style={{ justifyContent: 'flex-start' }}>
                <User size={16} />
                <span>My Profile</span>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/employee/attendance')} style={{ justifyContent: 'flex-start' }}>
                <Clock size={16} />
                <span>Attendance Logs</span>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/employee/calendar')} style={{ justifyContent: 'flex-start' }}>
                <CalendarDays size={16} />
                <span>Calendar View</span>
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/employee/payroll')} style={{ justifyContent: 'flex-start' }}>
                <CreditCard size={16} />
                <span>Salary Slips</span>
              </button>
            </div>
          </div>

          {/* Recent In-App Alerts */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '0.75rem' }}>
              <h3 className="card-title">Recent Alerts</h3>
              <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/employee/notifications')}>
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                No notifications right now.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: '0.625rem 0.75rem',
                      backgroundColor: n.read ? 'var(--slate-50)' : 'var(--primary-50)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{n.title}</div>
                    <div style={{ color: 'var(--slate-600)', marginTop: '2px' }}>{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Table */}
      {pendingLeaves.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Pending Leave Applications</h3>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/employee/leave')}>
              Manage All Leaves
            </button>
          </div>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingLeaves.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 700 }}>{l.leaveType}</td>
                    <td>{formatDate(l.startDate)} to {formatDate(l.endDate)}</td>
                    <td style={{ fontWeight: 700 }}>{l.totalDays}d</td>
                    <td>{l.reason}</td>
                    <td>
                      <Badge status={l.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
