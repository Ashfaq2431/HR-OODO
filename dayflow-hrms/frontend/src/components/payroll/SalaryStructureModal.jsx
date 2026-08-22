import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { payrollService } from '../../services/payrollService';
import { formatCurrency } from '../../utils/formatters';

export const SalaryStructureModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [basicPay, setBasicPay] = useState(0);
  const [allowances, setAllowances] = useState(0);
  const [taxDeduction, setTaxDeduction] = useState(0);
  const [pfDeduction, setPfDeduction] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (employee) {
      setBasicPay(employee.basicPay || 0);
      setAllowances(employee.allowances || 0);
      setTaxDeduction(employee.taxDeduction || 0);
      setPfDeduction(employee.pfDeduction || 0);
    }
  }, [employee]);

  const grossPay = Number(basicPay) + Number(allowances);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await payrollService.updateSalaryStructure(employee.userId || employee.id, {
        basicPay: Number(basicPay),
        allowances: Number(allowances),
        taxDeduction: Number(taxDeduction),
        pfDeduction: Number(pfDeduction)
      });

      if (res.success) {
        onSuccess && onSuccess('Salary structure updated successfully!');
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update salary structure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Salary Structure: ${employee?.firstName || ''} ${employee?.lastName || ''}`}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Updating...' : 'Save Structure'}
          </button>
        </>
      }
    >
      {error && (
        <div style={{ color: 'var(--danger-700)', backgroundColor: 'var(--danger-50)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Basic Salary ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={basicPay}
              onChange={(e) => setBasicPay(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allowances & Bonuses ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={allowances}
              onChange={(e) => setAllowances(e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary-900)' }}>Calculated Gross Pay:</span>
          <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--primary-700)' }}>{formatCurrency(grossPay)}</span>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Monthly Tax Deduction ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={taxDeduction}
              onChange={(e) => setTaxDeduction(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Provident Fund (PF) ($)</label>
            <input
              type="number"
              step="0.01"
              className="form-control"
              value={pfDeduction}
              onChange={(e) => setPfDeduction(e.target.value)}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};
