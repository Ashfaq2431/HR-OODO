import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { CheckInOutCard } from '../../components/attendance/CheckInOutCard';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const EmployeeAttendance = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('ALL'); // 'ALL' or 'WEEKLY'

  const loadAttendance = async () => {
    try {
      const res = await attendanceService.getMyAttendance();
      if (res.success) {
        setHistory(res.data);
      }
    } catch (e) {
      console.error('Failed to load attendance history', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const totalPresent = history.filter((r) => r.status === 'PRESENT').length;
  const totalHalfDay = history.filter((r) => r.status === 'HALF_DAY').length;
  const totalLeaves = history.filter((r) => r.status === 'LEAVE').length;

  const getFilteredRecords = () => {
    if (viewMode === 'WEEKLY') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const isoSeven = sevenDaysAgo.toISOString().split('T')[0];
      return history.filter((r) => r.date >= isoSeven);
    }
    return history;
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Attendance & Clock In</h1>
        <p className="page-subtitle">Track your daily work hours, check-in logs, and status records</p>
      </div>

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Present Days"
          value={totalPresent}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          label="Half-Day Records"
          value={totalHalfDay}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Leave Days"
          value={totalLeaves}
          icon={Calendar}
          color="purple"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <CheckInOutCard onStatusChange={loadAttendance} />
        </div>

        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '0.75rem' }}>Company Attendance Rules</h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>Standard work day consists of 8.00 hours.</li>
            <li>Clocking out under 5.00 hours is recorded as a Half-Day.</li>
            <li>If you are scheduled for approved leave, clock-in is restricted unless an Early Return is submitted and approved by HR.</li>
            <li>For missed check-ins or manual adjustments, contact your HR administrator.</li>
          </ul>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Attendance History</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${viewMode === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('ALL')}
            >
              All Records
            </button>
            <button
              className={`btn btn-sm ${viewMode === 'WEEKLY' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setViewMode('WEEKLY')}
            >
              Last 7 Days
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching attendance records..." />
        ) : (
          <AttendanceTable records={getFilteredRecords()} />
        )}
      </div>
    </div>
  );
};
