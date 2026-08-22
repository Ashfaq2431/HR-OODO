import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { PayrollTable } from '../../components/payroll/PayrollTable';
import { PayslipViewModal } from '../../components/payroll/PayslipViewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { StatCard } from '../../components/common/StatCard';
import { getCurrentBillingMonth, formatCurrency } from '../../utils/formatters';
import { DollarSign, CreditCard, Play, RefreshCw, Filter, ShieldAlert } from 'lucide-react';

export const AdminPayroll = () => {
  const defaultMonth = getCurrentBillingMonth();
  const [targetMonth, setTargetMonth] = useState(defaultMonth);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [forceRecalculate, setForceRecalculate] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const res = await payrollService.getGlobalPayroll(targetMonth);
      if (res.success) {
        setPayrollRecords(res.data);
      }
    } catch (e) {
      console.error('Failed to load payroll', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [targetMonth]);

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    setRunning(true);
    setErrorMsg('');
    setFeedbackMsg('');

    try {
      const res = await payrollService.runMonthlyPayroll({
        billingMonth: targetMonth,
        forceRecalculate
      });

      if (res.success) {
        setFeedbackMsg(`Successfully processed monthly payroll for ${targetMonth} (${res.data.length} employees).`);
        loadPayroll();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process monthly payroll.');
    } finally {
      setRunning(false);
    }
  };

  const handleRecalculateSingle = async (record) => {
    try {
      const res = await payrollService.recalculatePayroll(record.userId, record.billingMonth);
      if (res.success) {
        setFeedbackMsg(`Recalculated salary for ${record.employeeName}.`);
        loadPayroll();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Recalculation failed.');
    }
  };

  const handleViewPayslip = async (record) => {
    try {
      const res = await payrollService.getEmployeePayslip(record.userId, record.billingMonth);
      if (res.success) {
        setSelectedPayslip(res.data);
        setPayslipModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load payslip', err);
    }
  };

  const totalGross = payrollRecords.reduce((sum, r) => sum + (Number(r.grossPay) || 0), 0);
  const totalLop = payrollRecords.reduce((sum, r) => sum + (Number(r.unpaidLeaveDeductions) || 0), 0);
  const totalNet = payrollRecords.reduce((sum, r) => sum + (Number(r.totalFinalSalary) || 0), 0);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Monthly Payroll Control Engine</h1>
          <p className="page-subtitle">Run batch monthly salary calculations, apply LOP deductions, and issue payslips</p>
        </div>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}
      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          label="Total Employees Processed"
          value={payrollRecords.length}
          icon={CreditCard}
          color="primary"
          subtext={`For Month ${targetMonth}`}
        />
        <StatCard
          label="Total Gross Budget"
          value={formatCurrency(totalGross)}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          label="Total LOP Withheld"
          value={formatCurrency(totalLop)}
          icon={ShieldAlert}
          color="danger"
          subtext="From unpaid leaves"
        />
        <StatCard
          label="Total Net Disbursement"
          value={formatCurrency(totalNet)}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Payroll Run Controller Card */}
      <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: 'var(--slate-900)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'white' }}>Run Batch Monthly Payroll</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-400)', marginTop: '0.25rem' }}>
              Calculates daily salary rate, counts approved unpaid leave days, and computes net salary for all employees.
            </p>
          </div>

          <form onSubmit={handleRunPayroll} style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--slate-300)', fontWeight: 600 }}>Billing Month:</span>
              <input
                type="month"
                className="form-control"
                style={{ width: 'auto', backgroundColor: 'var(--slate-800)', color: 'white', borderColor: 'var(--slate-700)' }}
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                required
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-300)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={forceRecalculate}
                onChange={(e) => setForceRecalculate(e.target.checked)}
              />
              <span>Force Recalculate</span>
            </label>

            <button type="submit" className="btn btn-primary" disabled={running}>
              <Play size={16} />
              <span>{running ? 'Processing Payroll...' : 'Execute Payroll Run'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Processed Payroll Records ({targetMonth})</h3>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching payroll data..." />
        ) : (
          <PayrollTable
            records={payrollRecords}
            isAdmin={true}
            onViewPayslip={handleViewPayslip}
            onRecalculate={handleRecalculateSingle}
          />
        )}
      </div>

      {/* Payslip View Modal */}
      <PayslipViewModal
        isOpen={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        payslip={selectedPayslip}
      />
    </div>
  );
};
