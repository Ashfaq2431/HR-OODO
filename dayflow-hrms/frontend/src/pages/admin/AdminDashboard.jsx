import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { leaveService } from '../../services/leaveService';
import { earlyReturnService } from '../../services/earlyReturnService';
import { reportService } from '../../services/reportService';
import { StatCard } from '../../components/common/StatCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDateTime, formatDate } from '../../utils/formatters';
import {
  Users,
  Clock,
  CalendarDays,
  ArrowRightLeft,
  CreditCard,
  FileBarChart,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const AdminDashboard = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingEarlyReturns, setPendingEarlyReturns] = useState([]);
  const [complianceReport, setComplianceReport] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
    try {
      const [empRes, leaveRes, erRes, compRes, auditRes] = await Promise.all([
        profileService.getAllEmployees(),
        leaveService.getAllLeaves('PENDING'),
        earlyReturnService.getAllEarlyReturns('PENDING'),
        reportService.getAttendanceCompliance(),
        profileService.getAuditLogs()
      ]);

      if (empRes.success) setEmployees(empRes.data);
      if (leaveRes.success) setPendingLeaves(leaveRes.data);
      if (erRes.success) setPendingEarlyReturns(erRes.data);
      if (compRes.success) setComplianceReport(compRes.data);
      if (auditRes.success) setAuditLogs(auditRes.data.slice(0, 6));
    } catch (e) {
      console.error('Failed to load admin dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading HR admin console..." />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">HR Administrator Console</h1>
          <p className="page-subtitle">Global overview of company workforce, attendance compliance, leave queues, and payroll</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/admin/reports')}>
            <FileBarChart size={16} />
            <span>View Reports</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/admin/payroll')}>
            <CreditCard size={16} />
            <span>Process Payroll</span>
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="stat-grid">
        <StatCard
          label="Total Workforce"
          value={employees.length}
          icon={Users}
          color="primary"
          subtext="Active employees"
        />
        <StatCard
          label="Attendance Today"
          value={`${complianceReport?.overallComplianceRate || 0}%`}
          icon={Clock}
          color="success"
          subtext={`${complianceReport?.totalPresentToday || 0} clocked in`}
        />
        <StatCard
          label="Pending Leaves"
          value={pendingLeaves.length}
          icon={CalendarDays}
          color="warning"
          subtext="Awaiting decision"
        />
        <StatCard
          label="Early Return Requests"
          value={pendingEarlyReturns.length}
          icon={ArrowRightLeft}
          color="danger"
          subtext="Leave exceptions"
        />
      </div>

      {/* Action Queues Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Pending Leaves Queue */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Pending Leave Applications ({pendingLeaves.length})</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Review employee time-off requests</div>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/admin/leave')}>
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {pendingLeaves.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
              No pending leave requests to review!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingLeaves.slice(0, 4).map((l) => (
                <div
                  key={l.id}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{l.employeeName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                      {l.leaveType} • {formatDate(l.startDate)} to {formatDate(l.endDate)} ({l.totalDays}d)
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/leave')}>
                    Review
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Early Return Exception Alerts */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Early Return Check-In Alerts ({pendingEarlyReturns.length})</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Employees returning from approved leaves</div>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={() => navigate('/admin/early-return')}>
              <span>Manage</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {pendingEarlyReturns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
              No pending early return exceptions.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingEarlyReturns.slice(0, 3).map((er) => (
                <div
                  key={er.id}
                  style={{
                    padding: '0.875rem 1rem',
                    backgroundColor: 'var(--warning-50)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{er.employeeName}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning-700)' }}>
                      Return: {formatDate(er.requestDate)}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', marginTop: '0.25rem' }}>
                    "{er.reason}"
                  </p>
                  <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/admin/early-return')}>
                      Decide
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* System Audit Logs */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--primary-600)" />
            <span>Real-time System Audit Trail</span>
          </h3>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Target Entity</th>
                <th>New Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td style={{ fontWeight: 700 }}>{log.action}</td>
                  <td>{log.entityType} ({log.entityId})</td>
                  <td style={{ maxWidth: '280px', whiteSpace: 'normal', fontSize: '0.8125rem' }}>
                    {log.newValue || log.oldValue || '—'}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{log.ipAddress || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
