import React from 'react';
import { StatCard } from '../common/StatCard';
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';

export const LeaveDistributionChart = ({ data }) => {
  if (!data) return null;

  const {
    totalRequests = 0,
    pendingRequests = 0,
    approvedRequests = 0,
    rejectedRequests = 0,
    paidLeavesTaken = 0,
    sickLeavesTaken = 0,
    unpaidLeavesTaken = 0,
    leavesByDepartment = {}
  } = data;

  return (
    <div>
      <div className="stat-grid">
        <StatCard
          label="Total Applications"
          value={totalRequests}
          icon={CalendarDays}
          color="primary"
        />
        <StatCard
          label="Pending Approvals"
          value={pendingRequests}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Approved Applications"
          value={approvedRequests}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          label="Rejected / Withdrawn"
          value={rejectedRequests}
          icon={XCircle}
          color="danger"
        />
      </div>

      <div className="grid-2" style={{ marginTop: '1.5rem' }}>
        {/* Category Breakdown */}
        <div className="card">
          <h4 className="card-title" style={{ marginBottom: '1rem' }}>
            Days Taken by Leave Type
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600 }}>Paid Annual Leave</span>
                <strong>{paidLeavesTaken} days</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px' }}>
                <div style={{ width: `${Math.min(100, paidLeavesTaken * 5)}%`, height: '100%', backgroundColor: 'var(--primary-600)', borderRadius: '9999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600 }}>Sick / Medical Leave</span>
                <strong>{sickLeavesTaken} days</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px' }}>
                <div style={{ width: `${Math.min(100, sickLeavesTaken * 5)}%`, height: '100%', backgroundColor: 'var(--warning-500)', borderRadius: '9999px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: 600 }}>Unpaid Leave (LOP)</span>
                <strong>{unpaidLeavesTaken} days</strong>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px' }}>
                <div style={{ width: `${Math.min(100, unpaidLeavesTaken * 5)}%`, height: '100%', backgroundColor: 'var(--danger-500)', borderRadius: '9999px' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="card">
          <h4 className="card-title" style={{ marginBottom: '1rem' }}>
            Approved Leaves by Department
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(leavesByDepartment).map(([dept, count]) => (
              <div key={dept} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{dept}</span>
                <span style={{ fontWeight: 800, color: 'var(--purple-700)', fontSize: '0.875rem' }}>{count} days</span>
              </div>
            ))}
            {Object.keys(leavesByDepartment).length === 0 && (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                No approved department leaves on record.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
