import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { LeaveTable } from '../../components/leave/LeaveTable';
import { LeaveApplyModal } from '../../components/leave/LeaveApplyModal';
import { LeaveEditModal } from '../../components/leave/LeaveEditModal';
import { EarlyReturnModal } from '../../components/attendance/EarlyReturnModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { Alert } from '../../components/common/Alert';
import { CalendarDays, Plus, Clock, CheckCircle2 } from 'lucide-react';

export const EmployeeLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Modals state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedLeaveToEdit, setSelectedLeaveToEdit] = useState(null);
  const [earlyReturnModalOpen, setEarlyReturnModalOpen] = useState(false);
  const [selectedLeaveForEarlyReturn, setSelectedLeaveForEarlyReturn] = useState(null);

  const fetchLeaves = async () => {
    try {
      const res = await leaveService.getMyLeaves();
      if (res.success) {
        setLeaves(res.data);
      }
    } catch (e) {
      setError('Failed to load your leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleWithdraw = async (leave) => {
    if (!window.confirm(`Are you sure you want to withdraw your leave request from ${leave.startDate} to ${leave.endDate}?`)) {
      return;
    }

    try {
      const res = await leaveService.withdrawPendingLeave(leave.id);
      if (res.success) {
        setFeedbackMsg('Leave request has been withdrawn.');
        fetchLeaves();
      }
    } catch (err) {
      setError(err.message || 'Failed to withdraw leave.');
    }
  };

  const handleEditClick = (leave) => {
    setSelectedLeaveToEdit(leave);
    setEditModalOpen(true);
  };

  const handleEarlyReturnClick = (leave) => {
    setSelectedLeaveForEarlyReturn(leave);
    setEarlyReturnModalOpen(true);
  };

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Leave Management</h1>
          <p className="page-subtitle">Submit, modify, and track your leave applications and early return requests</p>
        </div>

        <button className="btn btn-primary" onClick={() => setApplyModalOpen(true)}>
          <Plus size={16} />
          <span>Apply for Leave</span>
        </button>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Applications"
          value={leaves.length}
          icon={CalendarDays}
          color="primary"
        />
        <StatCard
          label="Pending Review"
          value={pendingCount}
          icon={Clock}
          color="warning"
        />
        <StatCard
          label="Approved Requests"
          value={approvedCount}
          icon={CheckCircle2}
          color="success"
        />
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">My Leave History & Status</h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching leave applications..." />
        ) : (
          <LeaveTable
            leaves={leaves}
            isAdmin={false}
            onEditPending={handleEditClick}
            onWithdrawPending={handleWithdraw}
            onEarlyReturnRequest={handleEarlyReturnClick}
          />
        )}
      </div>

      {/* Apply Leave Modal */}
      <LeaveApplyModal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          fetchLeaves();
        }}
      />

      {/* Edit Pending Leave Modal */}
      <LeaveEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        leave={selectedLeaveToEdit}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          fetchLeaves();
        }}
      />

      {/* Early Return Modal */}
      <EarlyReturnModal
        isOpen={earlyReturnModalOpen}
        onClose={() => setEarlyReturnModalOpen(false)}
        leaveRequestId={selectedLeaveForEarlyReturn?.id}
        onSuccess={(msg) => {
          setFeedbackMsg(msg);
          fetchLeaves();
        }}
      />
    </div>
  );
};
