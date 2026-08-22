import React from 'react';

export const Badge = ({ status, text }) => {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');
  const displayText = text || status;

  return (
    <span className={`badge badge-${normalized}`}>
      {displayText}
    </span>
  );
};
