import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { profileService } from '../../services/profileService';
import { PayrollTable } from '../../components/payroll/PayrollTable';
import { PayslipViewModal } from '../../components/payroll/PayslipViewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, CreditCard, ShieldAlert, FileText } from 'lucide-react';

export const EmployeePayroll = () => {
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  const loadPayrollData = async () => {
    try {
      const [payRes, profRes] = await Promise.all([
        payrollService.getMyPayroll(),
        profileService.getMyProfile()
      ]);

      if (payRes.success) setPayrollRecords(payRes.data);
      if (profRes.success) setProfile(profRes.data);
    } catch (e) {
      console.error('Failed to load payroll records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, []);

  const handleViewPayslip = async (record) => {
    try {
      const res = await payrollService.getMyPayslip(record.billingMonth);
      if (res.success) {
        setSelectedPayslip(res.data);
        setPayslipModalOpen(true);
      }
    } catch (e) {
      console.error('Failed to load payslip', e);
    }
  };

  if (loading) return <LoadingSpinner text="Loading payroll data..." />;

  const latestRecord = payrollRecords[0];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">Salary & Payroll</h1>
        <p className="page-subtitle">View your compensation breakdown, Loss of Pay (LOP) calculations, and monthly salary slips</p>
      </div>

      {/* Salary Overview Cards */}
      <div className="stat-grid">
        <StatCard
          label="Basic Salary"
          value={formatCurrency(profile?.basicPay)}
          icon={DollarSign}
          color="primary"
        />
        <StatCard
          label="Monthly Allowances"
          value={formatCurrency(profile?.allowances)}
          icon={CreditCard}
          color="success"
        />
        <StatCard
          label="Gross Base Earnings"
          value={formatCurrency(profile?.grossPay)}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          label="Latest Net Disbursed"
          value={latestRecord ? formatCurrency(latestRecord.totalFinalSalary) : '—'}
          icon={FileText}
          color="success"
          subtext={latestRecord ? `For ${latestRecord.billingMonth}` : 'Pending run'}
        />
      </div>

      {/* LOP Explanation Callout */}
      <div
        style={{
          backgroundColor: 'var(--slate-100)',
          borderLeft: '4px solid var(--primary-600)',
          padding: '1rem 1.25rem',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
          color: 'var(--slate-700)'
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} color="var(--primary-600)" />
          <span>Loss of Pay (LOP) Deduction Policy</span>
        </div>
        <p>
          Unpaid leave days are deducted proportional to daily salary:
          <code style={{ marginLeft: '0.5rem', padding: '0.2rem 0.4rem', background: 'white', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
            Daily Rate = Gross Pay / Days in Month
          </code>
          . LOP is subtracted prior to net disbursement.
        </p>
      </div>

      {/* Payroll History Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Processed Monthly Payrolls</h3>
        </div>

        <PayrollTable
          records={payrollRecords}
          isAdmin={false}
          onViewPayslip={handleViewPayslip}
        />
      </div>

      {/* Payslip Detailed Modal */}
      <PayslipViewModal
        isOpen={payslipModalOpen}
        onClose={() => setPayslipModalOpen(false)}
        payslip={selectedPayslip}
      />
    </div>
  );
};
