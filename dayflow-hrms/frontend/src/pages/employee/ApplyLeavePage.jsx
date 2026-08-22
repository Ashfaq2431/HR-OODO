import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/leaveService';
import { Alert } from '../../components/common/Alert';
import { LEAVE_TYPE } from '../../utils/constants';
import { ArrowLeft, Send } from 'lucide-react';

export const ApplyLeavePage = () => {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    leaveType: LEAVE_TYPE.PAID,
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.startDate > formData.endDate) {
      setError('Start date cannot be after end date.');
      return;
    }

    setLoading(true);

    try {
      const res = await leaveService.applyLeave({
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason.trim()
      });

      if (res.success) {
        navigate('/employee/leave');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit leave application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.25rem' }}
        onClick={() => navigate('/employee/leave')}
      >
        <ArrowLeft size={16} />
        <span>Back to Leave Requests</span>
      </button>

      <div className="card">
        <h2 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
          Apply for Leave
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
          Fill out the details below to submit your official time-off request for HR review
        </p>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Leave Category</label>
            <select
              name="leaveType"
              className="form-control"
              value={formData.leaveType}
              onChange={handleChange}
              required
            >
              <option value={LEAVE_TYPE.PAID}>Paid Annual Leave</option>
              <option value={LEAVE_TYPE.SICK}>Sick / Medical Leave</option>
              <option value={LEAVE_TYPE.UNPAID}>Unpaid Leave (Subject to Loss of Pay deduction)</option>
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                name="startDate"
                min={todayStr}
                className="form-control"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                name="endDate"
                min={formData.startDate || todayStr}
                className="form-control"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Justification</label>
            <textarea
              name="reason"
              className="form-control"
              rows={4}
              placeholder="State the purpose of your leave request in detail..."
              value={formData.reason}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/employee/leave')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <Send size={16} />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
