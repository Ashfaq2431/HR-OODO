import React from 'react';
import { Badge } from '../common/Badge';
import { formatDate, formatTime, formatHours } from '../../utils/formatters';

export const AttendanceTable = ({ records = [], showEmployeeName = false, onRowClick }) => {
  if (!records || records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
        No attendance records found for this period.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {showEmployeeName && <th>Employee</th>}
            {showEmployeeName && <th>Department</th>}
            <th>Date</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Worked Hours</th>
            <th>Status</th>
            <th>Remarks / Override</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id || `${r.userId}-${r.date}`}
              onClick={() => onRowClick && onRowClick(r)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {showEmployeeName && (
                <td>
                  <div style={{ fontWeight: 700 }}>{r.employeeName || r.employeeId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{r.employeeId}</div>
                </td>
              )}
              {showEmployeeName && <td>{r.department || '—'}</td>}
              <td style={{ fontWeight: 600 }}>{formatDate(r.date)}</td>
              <td>{formatTime(r.checkInTime)}</td>
              <td>{formatTime(r.checkOutTime)}</td>
              <td style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{formatHours(r.totalWorkedHours)}</td>
              <td>
                <Badge status={r.status} />
              </td>
              <td>
                {r.manuallyOverridden ? (
                  <span style={{ fontSize: '0.75rem', color: 'var(--warning-700)', fontWeight: 600 }}>
                    Overridden: {r.overrideReason}
                  </span>
                ) : (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                    {r.remarks || '—'}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
