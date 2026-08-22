import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { AttendanceComplianceChart } from '../../components/reports/AttendanceComplianceChart';
import { LeaveDistributionChart } from '../../components/reports/LeaveDistributionChart';
import { PayrollSummaryChart } from '../../components/reports/PayrollSummaryChart';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { getCurrentBillingMonth } from '../../utils/formatters';
import { FileBarChart, Clock, CalendarDays, DollarSign, Download } from 'lucide-react';

export const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('ATTENDANCE'); // ATTENDANCE, LEAVE, PAYROLL
  const [targetMonth, setTargetMonth] = useState(getCurrentBillingMonth());

  const [complianceData, setComplianceData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ATTENDANCE') {
        const res = await reportService.getAttendanceCompliance();
        if (res.success) setComplianceData(res.data);
      } else if (activeTab === 'LEAVE') {
        const res = await reportService.getLeaveSummary();
        if (res.success) setLeaveData(res.data);
      } else if (activeTab === 'PAYROLL') {
        const res = await reportService.getPayrollSummary(targetMonth);
        if (res.success) setPayrollData(res.data);
      }
    } catch (e) {
      console.error('Failed to load report', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab, targetMonth]);

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Executive Reports & HR Analytics</h1>
          <p className="page-subtitle">Interactive compliance dashboards, leave trends, and corporate payroll disbursement summaries</p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
          <Download size={16} />
          <span>Export Summary</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${activeTab === 'ATTENDANCE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('ATTENDANCE')}
        >
          <Clock size={16} />
          <span>Attendance & Compliance</span>
        </button>
        <button
          className={`btn ${activeTab === 'LEAVE' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('LEAVE')}
        >
          <CalendarDays size={16} />
          <span>Leave Distribution</span>
        </button>
        <button
          className={`btn ${activeTab === 'PAYROLL' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
          onClick={() => setActiveTab('PAYROLL')}
        >
          <DollarSign size={16} />
          <span>Payroll & LOP Costs</span>
        </button>
      </div>

      {activeTab === 'PAYROLL' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-700)' }}>Select Month:</span>
          <input
            type="month"
            className="form-control"
            style={{ width: 'auto' }}
            value={targetMonth}
            onChange={(e) => setTargetMonth(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Compiling analytical reports..." />
      ) : (
        <div>
          {activeTab === 'ATTENDANCE' && <AttendanceComplianceChart data={complianceData} />}
          {activeTab === 'LEAVE' && <LeaveDistributionChart data={leaveData} />}
          {activeTab === 'PAYROLL' && <PayrollSummaryChart data={payrollData} />}
        </div>
      )}
    </div>
  );
};
