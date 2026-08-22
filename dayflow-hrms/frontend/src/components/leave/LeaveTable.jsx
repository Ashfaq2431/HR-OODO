import React from 'react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { LEAVE_STATUS } from '../../utils/constants';
import { Edit, Trash2, ArrowRightLeft, CheckSquare } from 'lucide-react';

export const LeaveTable = ({
  leaves = [],
  isAdmin = false,
  onEditPending,
  onWithdrawPending,
  onEarlyReturnRequest,
  onReviewLeave
}) => {
  if (!leaves || leaves.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
        No leave applications found.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {isAdmin && <th>Employee</th>}
            <th>Type</th>
            <th>Dates</th>
            <th>Days</th>
            <th>Reason</th>
            <th>Status</th>
            <th>HR Feedback</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((l) => {
            const isPending = l.status === LEAVE_STATUS.PENDING;
            const isApproved = l.status === LEAVE_STATUS.APPROVED;

            return (
              <tr key={l.id}>
                {isAdmin && (
                  <td>
                    <div style={{ fontWeight: 700 }}>{l.employeeName || l.employeeId}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{l.department}</div>
                  </td>
                )}
                <td style={{ fontWeight: 700 }}>{l.leaveType}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>{formatDate(l.startDate)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>to {formatDate(l.endDate)}</div>
                </td>
                <td style={{ fontWeight: 700 }}>{l.totalDays}d</td>
                <td style={{ maxWidth: '200px', whiteSpace: 'normal', fontSize: '0.8125rem' }}>{l.reason}</td>
                <td>
                  <Badge status={l.status} />
                </td>
                <td style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                  {l.hrComments || '—'}
                </td>
                <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {isAdmin ? (
                    isPending && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onReviewLeave && onReviewLeave(l)}
                      >
                        <CheckSquare size={14} />
                        <span>Review</span>
                      </button>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {isPending && (
                        <>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Edit Dates / Reason"
                            onClick={() => onEditPending && onEditPending(l)}
                          >
                            <Edit size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Withdraw Request"
                            onClick={() => onWithdrawPending && onWithdrawPending(l)}
                          >
                            <Trash2 size={14} />
                            <span>Withdraw</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          title="Request Early Return / Recall"
                          onClick={() => onEarlyReturnRequest && onEarlyReturnRequest(l)}
                        >
                          <ArrowRightLeft size={14} />
                          <span>Early Return</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
