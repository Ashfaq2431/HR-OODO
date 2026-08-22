import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle } from 'lucide-react';
import { earlyReturnService } from '../../services/earlyReturnService';

export const EarlyReturnModal = ({ isOpen, onClose, leaveRequestId, onSuccess }) => {
  const [reason, setReason] = useState('Need to return to work early for critical project deliverables.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a valid reason for early return.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await earlyReturnService.submitEarlyReturn({
        leaveRequestId,
        requestDate: todayStr,
        reason: reason.trim()
      });

      if (res.success) {
        onSuccess && onSuccess(res.message || 'Early return request sent to HR for approval.');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit early return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approved Leave Conflict – Early Return Required"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting Request...' : 'Request Check-In'}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div
          style={{
            backgroundColor: 'var(--warning-50)',
            color: 'var(--warning-700)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex'
          }}
        >
          <AlertTriangle size={28} />
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
            You are currently on approved leave for today.
          </h4>
          <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
            According to company policy, you cannot check in directly while on approved leave.
            Would you like to request an <strong>early return</strong> to work today? An HR administrator will review and approve your return.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ color: 'var(--danger-700)', backgroundColor: 'var(--danger-50)', padding: '0.625rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Reason for Early Return / Check-In</label>
          <textarea
            className="form-control"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are returning to work early..."
            required
          />
        </div>
      </form>
    </Modal>
  );
};
