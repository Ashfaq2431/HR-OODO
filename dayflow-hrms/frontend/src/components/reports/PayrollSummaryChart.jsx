import React from 'react';
import { StatCard } from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { DollarSign, CreditCard, PieChart, ShieldAlert } from 'lucide-react';

export const PayrollSummaryChart = ({ data }) => {
  if (!data) return null;

  const {
    billingMonth = '',
    totalEmployeesProcessed = 0,
    totalGrossPayout = 0,
    totalTaxDeducted = 0,
    totalPfDeducted = 0,
    totalLopDeductions = 0,
    totalNetDisbursement = 0,
    departmentCostBreakdown = {}
  } = data;

  return (
    <div>
      <div className="stat-grid">
        <StatCard
          label="Employees Processed"
          value={totalEmployeesProcessed}
          icon={CreditCard}
          color="primary"
          subtext={`Month: ${billingMonth}`}
        />
        <StatCard
          label="Total Gross Payroll"
          value={formatCurrency(totalGrossPayout)}
          icon={DollarSign}
          color="success"
        />
        <StatCard
          label="Total LOP Deductions"
          value={formatCurrency(totalLopDeductions)}
          icon={ShieldAlert}
          color="danger"
          subtext="Unpaid leave withholdings"
        />
        <StatCard
          label="Net Disbursed Salary"
          value={formatCurrency(totalNetDisbursement)}
          icon={PieChart}
          color="purple"
          subtext={`Tax: ${formatCurrency(totalTaxDeducted)} | PF: ${formatCurrency(totalPfDeducted)}`}
        />
      </div>

      {/* Department Payroll Costs */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h4 className="card-title" style={{ marginBottom: '1rem' }}>
          Department Payroll Cost Breakdown ({billingMonth})
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Object.entries(departmentCostBreakdown).map(([dept, cost]) => {
            const percentage = totalNetDisbursement > 0 ? Math.round((cost / totalNetDisbursement) * 100) : 0;
            return (
              <div key={dept}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{dept}</span>
                  <span style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                    {formatCurrency(cost)} ({percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px' }}>
                  <div
                    style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-600)',
                      borderRadius: '9999px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
