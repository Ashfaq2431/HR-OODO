import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Badge } from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';
import { Bell, CheckCheck, Inbox } from 'lucide-react';

export const EmployeeNotifications = () => {
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Notifications & Alerts</h1>
          <p className="page-subtitle">Real-time updates regarding your attendance, leave reviews, and payroll</p>
        </div>

        {notifications.length > 0 && (
          <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>
            <CheckCheck size={16} />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="card">
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--slate-400)' }}>
            <Inbox size={48} style={{ margin: '0 auto 1rem', strokeWidth: 1.5 }} />
            <h3 style={{ fontSize: '1rem', color: 'var(--slate-600)', marginBottom: '0.25rem' }}>No Notifications</h3>
            <p style={{ fontSize: '0.875rem' }}>You're completely caught up with all updates.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: n.read ? 'white' : 'var(--primary-50)',
                  border: n.read ? '1px solid var(--border-color)' : '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--slate-900)', fontSize: '0.9375rem' }}>
                      {n.title}
                    </span>
                    {!n.read && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-600)' }} />
                    )}
                  </div>
                  <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem' }}>{n.message}</p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.5rem' }}>
                    {formatDateTime(n.createdAt)}
                  </div>
                </div>

                <div>
                  <Badge status={n.type} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
