import React from 'react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { FileText, RefreshCw } from 'lucide-react';

export const PayrollTable = ({
  records = [],
  isAdmin = false,
  onViewPayslip,
  onRecalculate
}) => {
  if (!records || records.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--slate-500)' }}>
        No payroll records found for this period.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {isAdmin && <th>Employee</th>}
            <th>Month</th>
            <th>Basic</th>
            <th>Allowances</th>
            <th>Gross Pay</th>
            <th>Tax</th>
            <th>PF</th>
            <th>LOP (Unpaid)</th>
            <th>Net Salary</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((p) => (
            <tr key={p.id}>
              {isAdmin && (
                <td>
                  <div style={{ fontWeight: 700 }}>{p.employeeName || p.employeeId}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{p.department}</div>
                </td>
              )}
              <td style={{ fontWeight: 700 }}>{p.billingMonth}</td>
              <td>{formatCurrency(p.basicPay)}</td>
              <td>{formatCurrency(p.allowances)}</td>
              <td style={{ fontWeight: 600 }}>{formatCurrency(p.grossPay)}</td>
              <td style={{ color: 'var(--danger-700)' }}>-{formatCurrency(p.taxDeductions)}</td>
              <td style={{ color: 'var(--danger-700)' }}>-{formatCurrency(p.providentFund)}</td>
              <td>
                {p.unpaidLeaveCount > 0 ? (
                  <div>
                    <span style={{ color: 'var(--danger-700)', fontWeight: 700 }}>
                      -{formatCurrency(p.unpaidLeaveDeductions)}
                    </span>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>
                      ({p.unpaidLeaveCount}d LOP)
                    </div>
                  </div>
                ) : (
                  <span style={{ color: 'var(--slate-400)' }}>$0.00</span>
                )}
              </td>
              <td style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.9375rem' }}>
                {formatCurrency(p.totalFinalSalary)}
              </td>
              <td>
                <Badge status={p.paymentStatus || 'PAID'} />
              </td>
              <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    title="View Payslip"
                    onClick={() => onViewPayslip && onViewPayslip(p)}
                  >
                    <FileText size={14} />
                    <span>Payslip</span>
                  </button>

                  {isAdmin && onRecalculate && (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      title="Recalculate LOP & Salary"
                      onClick={() => onRecalculate(p)}
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
