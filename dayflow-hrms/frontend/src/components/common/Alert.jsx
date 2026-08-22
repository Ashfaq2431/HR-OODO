import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export const Alert = ({ type = 'info', title, message, children, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color="#15803d" />;
      case 'danger':
      case 'error':
        return <XCircle size={20} color="#b91c1c" />;
      case 'warning':
        return <AlertCircle size={20} color="#b45309" />;
      default:
        return <Info size={20} color="#0369a1" />;
    }
  };

  const getStyle = () => {
    switch (type) {
      case 'success':
        return { bg: 'var(--success-50)', border: 'rgba(34, 197, 94, 0.3)', text: 'var(--success-700)' };
      case 'danger':
      case 'error':
        return { bg: 'var(--danger-50)', border: 'rgba(239, 68, 68, 0.3)', text: 'var(--danger-700)' };
      case 'warning':
        return { bg: 'var(--warning-50)', border: 'rgba(245, 158, 11, 0.3)', text: 'var(--warning-700)' };
      default:
        return { bg: 'var(--info-50)', border: 'rgba(14, 165, 233, 0.3)', text: 'var(--info-700)' };
    }
  };

  const style = getStyle();

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon()}</div>
      <div style={{ flex: 1, color: style.text, fontSize: '0.875rem' }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '2px' }}>{title}</div>}
        {message && <div>{message}</div>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: style.text,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '1rem',
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
