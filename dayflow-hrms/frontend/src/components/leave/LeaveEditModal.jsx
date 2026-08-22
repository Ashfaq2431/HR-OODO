import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { leaveService } from '../../services/leaveService';
import { LEAVE_TYPE } from '../../utils/constants';

export const LeaveEditModal = ({ isOpen, onClose, leave, onSuccess }) => {
  const [leaveType, setLeaveType] = useState('PAID');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (leave) {
      setLeaveType(leave.leaveType || 'PAID');
      setStartDate(leave.startDate || '');
      setEndDate(leave.endDate || '');
      setReason(leave.reason || '');
    }
  }, [leave]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (startDate > endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await leaveService.updatePendingLeave(leave.id, {
        leaveType,
        startDate,
        endDate,
        reason: reason.trim()
      });

      if (res.success) {
        onSuccess && onSuccess('Leave request updated successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Pending Leave Request"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </>
      }
    >
      {error && (
        <div style={{ color: 'var(--danger-700)', backgroundColor: 'var(--danger-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Leave Category</label>
          <select
            className="form-control"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            required
          >
            <option value={LEAVE_TYPE.PAID}>Paid Annual Leave</option>
            <option value={LEAVE_TYPE.SICK}>Medical / Sick Leave</option>
            <option value={LEAVE_TYPE.UNPAID}>Unpaid Leave (Loss of Pay / LOP)</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Reason / Remarks</label>
          <textarea
            className="form-control"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>
      </form>
    </Modal>
  );
};
