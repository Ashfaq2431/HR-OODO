import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollService } from '../../services/payrollService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowLeft, Printer, Building2 } from 'lucide-react';

export const EmployeePayslip = () => {
  const { month } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        const res = await payrollService.getMyPayslip(month);
        if (res.success) {
          setPayslip(res.data);
        }
      } catch (err) {
        setError('Failed to load payslip for ' + month);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslip();
  }, [month]);

  if (loading) return <LoadingSpinner text="Generating payslip view..." />;
  if (error) return <div style={{ color: 'var(--danger-700)', padding: '2rem' }}>{error}</div>;
  if (!payslip) return null;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/employee/payroll')}>
          <ArrowLeft size={16} />
          <span>Back to Payroll</span>
        </button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} />
          <span>Print / Save PDF</span>
        </button>
      </div>

      <div className="payslip-container">
        {/* Header */}
        <div className="payslip-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={24} color="var(--primary-600)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>DAYFLOW HRMS</h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
              Official Electronic Salary Disbursal Statement
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary-700)' }}>
              PAYSLIP: {payslip.billingMonth}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
              Days in Month: {payslip.daysInMonth}d | Status: {payslip.paymentStatus || 'PAID'}
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>EMPLOYEE NAME</div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{payslip.employeeName}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>EMPLOYEE ID</div>
            <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{payslip.employeeId}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>DEPARTMENT</div>
            <div style={{ fontWeight: 600 }}>{payslip.department || '—'}</div>
          </div>
          <div>
            <div style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>DESIGNATION</div>
            <div style={{ fontWeight: 600 }}>{payslip.designation || '—'}</div>
          </div>
        </div>

        {/* Breakdown Tables */}
        <div className="payslip-grid">
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--success-700)', marginBottom: '0.5rem' }}>
              Earnings (+)
            </h4>
            <table className="payslip-table">
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(payslip.basicPay)}</td>
                </tr>
                <tr>
                  <td>Allowances & Bonuses</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(payslip.allowances)}</td>
                </tr>
                <tr className="payslip-total">
                  <td>Gross Earnings</td>
                  <td style={{ textAlign: 'right', color: 'var(--success-700)' }}>{formatCurrency(payslip.grossEarnings)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--danger-700)', marginBottom: '0.5rem' }}>
              Deductions (-)
            </h4>
            <table className="payslip-table">
              <tbody>
                <tr>
                  <td>Income Tax Deduction</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(payslip.taxDeductions)}</td>
                </tr>
                <tr>
                  <td>Provident Fund (PF)</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatCurrency(payslip.providentFund)}</td>
                </tr>
                <tr>
                  <td>
                    Loss of Pay (LOP)
                    <div style={{ fontSize: '0.6875rem', color: 'var(--slate-500)' }}>
                      {payslip.unpaidLeaveDays} unpaid day(s) @ {formatCurrency(payslip.dailyRate)}/day
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--danger-700)' }}>
                    {formatCurrency(payslip.lopDeduction)}
                  </td>
                </tr>
                <tr className="payslip-total">
                  <td>Total Deductions</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger-700)' }}>{formatCurrency(payslip.totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net Salary Total */}
        <div style={{ backgroundColor: 'var(--slate-900)', color: 'white', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate-400)' }}>
              NET SALARY PAYABLE
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-300)' }}>
              Direct Electronic Bank Transfer
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#38bdf8' }}>
            {formatCurrency(payslip.netSalary)}
          </div>
        </div>
      </div>
    </div>
  );
};
