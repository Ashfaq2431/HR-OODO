import React from 'react';

export const StatCard = ({ label, value, icon: Icon, color = 'primary', subtext }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'success':
        return { bg: 'var(--success-50)', color: 'var(--success-700)' };
      case 'danger':
        return { bg: 'var(--danger-50)', color: 'var(--danger-700)' };
      case 'warning':
        return { bg: 'var(--warning-50)', color: 'var(--warning-700)' };
      case 'purple':
        return { bg: 'var(--purple-50)', color: 'var(--purple-700)' };
      default:
        return { bg: 'var(--primary-50)', color: 'var(--primary-700)' };
    }
  };

  const style = getColorStyles();

  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && (
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.25rem' }}>
            {subtext}
          </div>
        )}
      </div>
      {Icon && (
        <div className="stat-icon" style={{ backgroundColor: style.bg, color: style.color }}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
};
