import React from 'react';
import { Badge } from '../common/Badge';
import { formatTime, formatHours } from '../../utils/formatters';

export const AttendanceCalendar = ({ year, month, records = [], onSelectDate }) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay(); // 0 = Sunday

  const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map records by day
  const recordMap = {};
  records.forEach((r) => {
    if (r.date) {
      const dayNum = parseInt(r.date.split('-')[2], 10);
      recordMap[dayNum] = r;
    }
  });

  const cells = [];
  // Empty padding cells for start of month
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="calendar-day-cell" style={{ opacity: 0.25, backgroundColor: 'var(--slate-50)' }} />);
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const record = recordMap[day];
    const isToday =
      new Date().getDate() === day &&
      new Date().getMonth() + 1 === month &&
      new Date().getFullYear() === year;

    cells.push(
      <div
        key={`day-${day}`}
        className="calendar-day-cell"
        onClick={() => onSelectDate && onSelectDate(day, record)}
        style={{
          border: isToday ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="calendar-day-number">{day}</span>
          {record && <Badge status={record.status} />}
        </div>

        {record && (
          <div style={{ marginTop: '0.375rem', fontSize: '0.75rem' }}>
            {record.checkInTime && (
              <div style={{ color: 'var(--slate-600)' }}>
                In: <strong>{formatTime(record.checkInTime)}</strong>
              </div>
            )}
            {record.totalWorkedHours > 0 && (
              <div style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                {formatHours(record.totalWorkedHours)}
              </div>
            )}
          </div>
        )}

        {!record && (
          <div style={{ fontSize: '0.6875rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
            No record
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="calendar-grid" style={{ marginBottom: '0.5rem' }}>
        {dayHeaders.map((header) => (
          <div key={header} className="calendar-day-header">
            {header}
          </div>
        ))}
      </div>
      <div className="calendar-grid">{cells}</div>
    </div>
  );
};
