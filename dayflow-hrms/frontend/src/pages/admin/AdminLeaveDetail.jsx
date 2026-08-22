import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { leaveService } from '../../services/leaveService';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, Check, X } from 'lucide-react';

export const AdminLeaveDetail = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hrComments, setHrComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadLeave = async () => {
    try {
      const res = await leaveService.getLeaveById(requestId);
      if (res.success) {
        setLeave(res.data);
        setHrComments(res.data.hrComments || '');
      }
    } catch (e) {
      setErrorMsg('Failed to load leave application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeave();
  }, [requestId]);

  const handleDecision = async (isApprove) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      let res;
      if (isApprove) {
        res = await leaveService.approveLeave(requestId, { hrComments: hrComments.trim() });
      } else {
        res = await leaveService.rejectLeave(requestId, { hrComments: hrComments.trim() });
      }

      if (res.success) {
        setFeedbackMsg(`Leave request ${isApprove ? 'APPROVED' : 'REJECTED'} successfully.`);
        setLeave(res.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading leave application..." />;
  if (!leave) return <div style={{ padding: '2rem', color: 'var(--danger-700)' }}>Leave not found</div>;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }} onClick={() => navigate('/admin/leave')}>
        <ArrowLeft size={16} />
        <span>Back to Leave Queue</span>
      </button>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}
      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Leave Request #{leave.id}</h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
              Submitted by <strong>{leave.employeeName}</strong> ({leave.employeeId})
            </div>
          </div>
          <Badge status={leave.status} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Department:</span>
            <div style={{ fontWeight: 700 }}>{leave.department || '—'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Leave Category:</span>
            <div style={{ fontWeight: 700 }}>{leave.leaveType}</div>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>Start Date:</span>
            <div style={{ fontWeight: 700 }}>{formatDate(leave.startDate)}</div>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>End Date:</span>
            <div style={{ fontWeight: 700 }}>{formatDate(leave.endDate)}</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--slate-500)' }}>Total Duration:</span>
            <div style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '1rem' }}>{leave.totalDays} day(s)</div>
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--slate-500)' }}>Employee Stated Reason:</span>
            <p style={{ marginTop: '0.25rem', color: 'var(--slate-800)', fontStyle: 'italic' }}>
              "{leave.reason}"
            </p>
          </div>
        </div>

        {leave.status === 'PENDING' ? (
          <div>
            <div className="form-group">
              <label className="form-label">HR Review Comments</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter feedback for employee..."
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                className="btn btn-danger"
                onClick={() => handleDecision(false)}
                disabled={submitting}
              >
                <X size={16} />
                <span>Reject Application</span>
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleDecision(true)}
                disabled={submitting}
              >
                <Check size={16} />
                <span>Approve Application</span>
              </button>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--slate-100)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--slate-500)' }}>HR Decision Feedback:</span>
            <p style={{ fontWeight: 600, marginTop: '0.25rem', color: 'var(--slate-800)' }}>
              {leave.hrComments || 'No comments recorded.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
