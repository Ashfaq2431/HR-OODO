import React from 'react';
import { StatCard } from '../common/StatCard';
import { Users, CheckCircle2, UserX, Clock, Percent } from 'lucide-react';

export const AttendanceComplianceChart = ({ data }) => {
  if (!data) return null;

  const {
    totalEmployees = 0,
    totalPresentToday = 0,
    totalAbsentToday = 0,
    totalHalfDayToday = 0,
    totalOnLeaveToday = 0,
    averageWorkingHours = 0,
    overallComplianceRate = 0,
    departmentAttendanceBreakdown = {}
  } = data;

  return (
    <div>
      <div className="stat-grid">
        <StatCard
          label="Total Workforce"
          value={totalEmployees}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Present Today"
          value={totalPresentToday}
          icon={CheckCircle2}
          color="success"
          subtext={`${totalHalfDayToday} half-day`}
        />
        <StatCard
          label="Absent Today"
          value={totalAbsentToday}
          icon={UserX}
          color="danger"
          subtext={`${totalOnLeaveToday} on approved leave`}
        />
        <StatCard
          label="Compliance Rate"
          value={`${overallComplianceRate}%`}
          icon={Percent}
          color="purple"
          subtext={`Avg: ${averageWorkingHours}h / employee`}
        />
      </div>

      {/* Visual Bar Breakdown by Department */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h4 className="card-title" style={{ marginBottom: '1rem' }}>
          Department Attendance Breakdown Today
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(departmentAttendanceBreakdown).map(([dept, count]) => {
            const percentage = totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0;
            return (
              <div key={dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{dept}</span>
                  <span style={{ color: 'var(--slate-600)' }}>{count} present ({percentage}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-600)',
                      borderRadius: '9999px',
                      transition: 'width 0.5s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
          {Object.keys(departmentAttendanceBreakdown).length === 0 && (
            <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
              No department attendance clocked in yet today.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
