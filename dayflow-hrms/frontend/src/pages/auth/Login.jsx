import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, isHRAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login({ email: email.trim(), password });
      if (user.role === 'ROLE_HR_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
        Sign In to Your Portal
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
        Enter your official credentials to access Dayflow HRMS
      </p>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Work Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. employee@dayflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading}
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Quick Demo Logins Helper */}
      <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-400)', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
          Quick Demo Credentials
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => handleDemoFill('admin@dayflow.com', 'Admin@123')}
          >
            <ShieldCheck size={14} color="var(--primary-600)" />
            <span>Admin Demo</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, fontSize: '0.75rem' }}
            onClick={() => handleDemoFill('alex.morgan@dayflow.com', 'Emp@123')}
          >
            <UserCheck size={14} color="var(--success-700)" />
            <span>Employee Demo</span>
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        New employee?{' '}
        <Link to="/signup" style={{ color: 'var(--primary-600)', fontWeight: 700, textDecoration: 'none' }}>
          Create Account
        </Link>
      </div>
    </div>
  );
};
