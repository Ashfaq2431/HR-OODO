import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Bell, ShieldCheck, UserCheck, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, isHRAdmin } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--slate-500)', fontSize: '0.875rem' }}>
        <Calendar size={16} />
        <span style={{ fontWeight: 600 }}>{todayFormatted}</span>
      </div>

      <div className="navbar-user">
        {/* Notification Bell */}
        <button
          onClick={() => navigate(isHRAdmin() ? '/admin/notifications' : '/employee/notifications')}
          style={{
            position: 'relative',
            background: 'var(--slate-100)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem',
            cursor: 'pointer',
            color: 'var(--slate-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)'
          }}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--danger-500)',
                color: 'white',
                fontSize: '0.6875rem',
                fontWeight: 800,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid white'
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div
          onClick={() => navigate(isHRAdmin() ? '/admin/employees' : '/employee/profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.375rem 0.75rem 0.375rem 0.375rem',
            backgroundColor: 'var(--slate-50)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: isHRAdmin() ? 'var(--primary-700)' : 'var(--primary-500)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.8125rem'
            }}
          >
            {user?.firstName?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isHRAdmin() ? (
                <>
                  <ShieldCheck size={12} color="var(--primary-600)" />
                  <span>HR Administrator</span>
                </>
              ) : (
                <>
                  <UserCheck size={12} color="var(--success-500)" />
                  <span>Employee ({user?.employeeId})</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
