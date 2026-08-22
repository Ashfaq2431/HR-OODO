import React, { useState, useEffect } from 'react';
import { earlyReturnService } from '../../services/earlyReturnService';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { EARLY_RETURN_STATUS } from '../../utils/constants';
import { ArrowRightLeft, Check, X, Filter } from 'lucide-react';

export const AdminAttendanceExceptions = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Review Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hrComments, setHrComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await earlyReturnService.getAllEarlyReturns(statusFilter || null);
      if (res.success) {
        setRequests(res.data);
      }
    } catch (e) {
      console.error('Failed to load early returns', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [statusFilter]);

  const handleOpenReview = (req) => {
    setSelectedReq(req);
    setHrComments('');
    setErrorMsg('');
    setReviewModalOpen(true);
  };

  const handleDecision = async (isApprove) => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      let res;
      if (isApprove) {
        res = await earlyReturnService.approveEarlyReturn(selectedReq.id, { hrComments: hrComments.trim() });
      } else {
        res = await earlyReturnService.rejectEarlyReturn(selectedReq.id, { hrComments: hrComments.trim() });
      }

      if (res.success) {
        setFeedbackMsg(`Early return request ${isApprove ? 'APPROVED (Leave adjusted & check-in unblocked)' : 'REJECTED'}.`);
        setReviewModalOpen(false);
        loadRequests();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process early return decision.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Attendance Exceptions & Early Returns</h1>
        <p className="page-subtitle">Manage approved leave conflicts when employees report to work ahead of schedule</p>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Filter size={16} color="var(--slate-500)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Status:</span>
          <select
            className="form-control"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Requests</option>
            <option value={EARLY_RETURN_STATUS.PENDING}>Pending Only</option>
            <option value={EARLY_RETURN_STATUS.APPROVED}>Approved</option>
            <option value={EARLY_RETURN_STATUS.REJECTED}>Rejected</option>
          </select>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading early return requests..." />
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
            No early return exception requests found.
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Return Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>HR Comments</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{r.employeeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{r.employeeId}</div>
                    </td>
                    <td>{r.department || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                      {formatDate(r.requestDate)}
                    </td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'normal', fontSize: '0.8125rem' }}>
                      "{r.reason}"
                    </td>
                    <td>
                      <Badge status={r.status} />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                      {r.hrComments || '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {r.status === EARLY_RETURN_STATUS.PENDING ? (
                        <button className="btn btn-primary btn-sm" onClick={() => handleOpenReview(r)}>
                          <ArrowRightLeft size={14} />
                          <span>Review</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>Decided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Decide Early Return & Check-In Request"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setReviewModalOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={() => handleDecision(false)} disabled={submitting}>
              <X size={16} />
              <span>Reject Request</span>
            </button>
            <button type="button" className="btn btn-success" onClick={() => handleDecision(true)} disabled={submitting}>
              <Check size={16} />
              <span>Approve & Unblock Check-In</span>
            </button>
          </>
        }
      >
        {errorMsg && (
          <div style={{ color: 'var(--danger-700)', backgroundColor: 'var(--danger-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {errorMsg}
          </div>
        )}

        <div style={{ backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <div><strong>Employee:</strong> {selectedReq?.employeeName} ({selectedReq?.employeeId})</div>
          <div style={{ marginTop: '0.25rem' }}><strong>Requested Return Date:</strong> {formatDate(selectedReq?.requestDate)}</div>
          <div style={{ marginTop: '0.5rem', color: 'var(--slate-700)' }}>
            <strong>Employee's Stated Reason:</strong>
            <p style={{ fontStyle: 'italic', marginTop: '0.25rem' }}>"{selectedReq?.reason}"</p>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">HR Feedback / Approval Comments</label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Add comments explaining approval or rejection..."
            value={hrComments}
            onChange={(e) => setHrComments(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
