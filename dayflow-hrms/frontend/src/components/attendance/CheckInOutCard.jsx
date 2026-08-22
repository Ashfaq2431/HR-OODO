import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { Badge } from '../common/Badge';
import { EarlyReturnModal } from './EarlyReturnModal';
import { formatTime, formatHours } from '../../utils/formatters';
import { LogIn, LogOut, Clock, CheckCircle2 } from 'lucide-react';

export const CheckInOutCard = ({ onStatusChange }) => {
  const [summary, setSummary] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showEarlyReturnModal, setShowEarlyReturnModal] = useState(false);
  const [conflictedLeaveId, setConflictedLeaveId] = useState(null);

  const fetchSummary = async () => {
    try {
      const res = await attendanceService.getTodaySummary();
      if (res.success) {
        setSummary(res.data);
      }
    } catch (e) {
      console.error('Failed to load today summary', e);
    }
  };

  useEffect(() => {
    fetchSummary();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await attendanceService.checkIn({ remarks: remarks.trim() });
      if (res.success) {
        setSuccessMsg('Check-in recorded successfully!');
        setRemarks('');
        fetchSummary();
        onStatusChange && onStatusChange();
      }
    } catch (err) {
      if (err.errorCode === 'APPROVED_LEAVE_CONFLICT') {
        const leaveId = err.data?.leaveRequestId || summary?.activeLeaveRequestId;
        setConflictedLeaveId(leaveId);
        setShowEarlyReturnModal(true);
      } else {
        setError(err.message || 'Check-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await attendanceService.checkOut({ remarks: remarks.trim() });
      if (res.success) {
        setSuccessMsg('Check-out recorded successfully! Worked hours logged.');
        setRemarks('');
        fetchSummary();
        onStatusChange && onStatusChange();
      }
    } catch (err) {
      setError(err.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const isCheckedIn = summary?.checkedIn;
  const isCheckedOut = summary?.checkedOut;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daily Attendance & Time Tracker
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '0.375rem' }}>Today's Status</div>
          <Badge status={summary?.status || 'ABSENT'} />
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--danger-50)', color: 'var(--danger-700)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: 'var(--success-50)', color: 'var(--success-700)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid of times */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>CHECK-IN</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatTime(summary?.checkInTime)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>CHECK-OUT</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
            {formatTime(summary?.checkOutTime)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', fontWeight: 600 }}>HOURS LOGGED</div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-700)', marginTop: '0.25rem' }}>
            {formatHours(summary?.workedHours)}
          </div>
        </div>
      </div>

      {/* Action Area */}
      {!isCheckedOut && (
        <div style={{ marginTop: '1rem' }}>
          <div className="form-group" style={{ marginBottom: '0.875rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Optional check-in / check-out remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!isCheckedIn ? (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleCheckIn}
                disabled={loading}
              >
                <LogIn size={20} />
                <span>{loading ? 'Processing...' : 'Clock In Now'}</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-danger btn-lg"
                style={{ flex: 1 }}
                onClick={handleCheckOut}
                disabled={loading}
              >
                <LogOut size={20} />
                <span>{loading ? 'Processing...' : 'Clock Out Now'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {isCheckedOut && (
        <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-md)', color: 'var(--slate-600)', fontSize: '0.875rem', fontWeight: 600 }}>
          Work day completed for today. Great work!
        </div>
      )}

      {/* Early Return Trigger Modal */}
      <EarlyReturnModal
        isOpen={showEarlyReturnModal}
        onClose={() => setShowEarlyReturnModal(false)}
        leaveRequestId={conflictedLeaveId}
        onSuccess={(msg) => {
          setSuccessMsg(msg);
          fetchSummary();
        }}
      />
    </div>
  );
};
