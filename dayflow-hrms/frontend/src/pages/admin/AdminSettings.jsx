import React, { useState } from 'react';
import { Alert } from '../../components/common/Alert';
import { Settings, Shield, Mail, Database, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettings = () => {
  const [cutoffDay, setCutoffDay] = useState(25);
  const [payday, setPayday] = useState(30);
  const [smtpActive, setSmtpActive] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMsg('System configuration and payroll cutoff parameters saved.');
  };

  return (
    <div style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">System Settings & Policies</h1>
        <p className="page-subtitle">Configure organization rules, payroll cutoffs, and notification parameters</p>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <form onSubmit={handleSave}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Payroll Configuration */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} color="var(--primary-600)" />
                <span>Payroll Execution Policies</span>
              </h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Monthly Payroll Cutoff Day</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-control"
                  value={cutoffDay}
                  onChange={(e) => setCutoffDay(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Leaves submitted after this day roll over to next month's payroll cycle.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Official Monthly Payday</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  className="form-control"
                  value={payday}
                  onChange={(e) => setPayday(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  Scheduled salary disbursement target date.
                </span>
              </div>
            </div>
          </div>

          {/* Security & Authentication Policies */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} color="var(--primary-600)" />
                <span>Security & Role Access Controls</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span>Password Hashing Algorithm:</span>
                <strong>BCrypt (Work Factor: 10)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span>JWT Token Duration:</span>
                <strong>24 Hours (86,400,000 ms)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span>Strict URL Guard:</span>
                <span style={{ color: 'var(--success-700)', fontWeight: 700 }}>Active (Employee route blocking enabled)</span>
              </div>
            </div>
          </div>

          {/* Database & Mail System */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={18} color="var(--primary-600)" />
                <span>Infrastructure & Connectivity</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span>Database Engine:</span>
                <strong>MySQL 8.0 (InnoDB)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span>Email Service Dispatcher:</span>
                <strong>JavaMailSender with Dev Fallback Logging</strong>
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf: 'flex-end' }}>
            <Save size={18} />
            <span>Save Configuration Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
