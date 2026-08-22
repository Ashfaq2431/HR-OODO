import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { leaveService } from '../../services/leaveService';
import { formatDate } from '../../utils/formatters';
import { Check, X } from 'lucide-react';

export const LeaveApprovalModal = ({ isOpen, onClose, leave, onSuccess }) => {
  const [hrComments, setHrComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!leave) return null;

  const handleAction = async (isApprove) => {
    setSubmitting(true);
    setError('');

    try {
      let res;
      if (isApprove) {
        res = await leaveService.approveLeave(leave.id, { hrComments: hrComments.trim() });
      } else {
        res = await leaveService.rejectLeave(leave.id, { hrComments: hrComments.trim() });
      }

      if (res.success) {
        onSuccess && onSuccess(`Leave application ${isApprove ? 'APPROVED' : 'REJECTED'} successfully.`);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to process leave decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Leave Application"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleAction(false)}
            disabled={submitting}
          >
            <X size={16} />
            <span>Reject Leave</span>
          </button>
          <button
            type="button"
            className="btn btn-success"
            onClick={() => handleAction(true)}
            disabled={submitting}
          >
            <Check size={16} />
            <span>Approve Leave</span>
          </button>
        </>
      }
    >
      {error && (
        <div style={{ color: 'var(--danger-700)', backgroundColor: 'var(--danger-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Employee: </span>
            <strong>{leave.employeeName || leave.employeeId}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Department: </span>
            <strong>{leave.department || '—'}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Leave Type: </span>
            <strong>{leave.leaveType}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Duration: </span>
            <strong>{leave.totalDays} day(s)</strong>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--slate-500)' }}>Dates: </span>
            <strong>{formatDate(leave.startDate)} to {formatDate(leave.endDate)}</strong>
          </div>
          <div style={{ gridColumn: 'span 2', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--slate-500)' }}>Reason: </span>
            <p style={{ marginTop: '0.25rem', color: 'var(--slate-800)', fontStyle: 'italic' }}>"{leave.reason}"</p>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">HR Feedback / Review Comments</label>
        <textarea
          className="form-control"
          rows={3}
          placeholder="Optional comments for employee notification..."
          value={hrComments}
          onChange={(e) => setHrComments(e.target.value)}
        />
      </div>
    </Modal>
  );
};
