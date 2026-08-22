import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { LeaveTable } from '../../components/leave/LeaveTable';
import { LeaveApprovalModal } from '../../components/leave/LeaveApprovalModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { StatCard } from '../../components/common/StatCard';
import { LEAVE_STATUS } from '../../utils/constants';
import { CalendarDays, Clock, CheckCircle2, XCircle, Filter } from 'lucide-react';

export const AdminLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveService.getAllLeaves(statusFilter || null);
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (e) {
      console.error('Failed to load leaves', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, [statusFilter]);

  const handleReviewClick = (leave) => {
    setSelectedLeaveForReview(leave);
    setReviewModalOpen(true);
  };

  const pendingCount = leaves.filter((l) => l.status === LEAVE_STATUS.PENDING).length;
  const approvedCount = leaves.filter((l) => l.status === LEAVE_STATUS.APPROVED).length;
  const rejectedCount = leaves.filter((l) => l.status === LEAVE_STATUS.REJECTED).length;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Company Leave Approval Queue</h1>
        <p className="page-subtitle">Review, approve, or reject employee leave requests and set HR feedback</p>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          label="Pending Applications"
          value={pendingCount}
          icon={Clock}
          color="warning"
          subtext="Requires immediate decision"
        />
        <StatCard
          label="Approved Leaves"
          value={approvedCount}
          icon={CheckCircle2}
          color="success"
        />
        <StatCard
          label="Rejected Applications"
          value={rejectedCount}
          icon={XCircle}
          color="danger"
        />
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="var(--slate-500)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter by Status:</span>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Applications</option>
            <option value={LEAVE_STATUS.PENDING}>Pending Only</option>
            <option value={LEAVE_STATUS.APPROVED}>Approved</option>
            <option value={LEAVE_STATUS.REJECTED}>Rejected</option>
            <option value={LEAVE_STATUS.WITHDRAWN}>Withdrawn</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Fetching leave applications..." />
        ) : (
          <LeaveTable
            leaves={leaves}
            isAdmin={true}
            onReviewLeave={handleReviewClick}
          />
        )}
      </div>

      {/* Review & Decision Modal */}
      <LeaveApprovalModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        leave={selectedLeaveForReview}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          loadLeaves();
        }}
      />
    </div>
  );
};
