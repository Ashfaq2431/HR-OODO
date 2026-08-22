import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { ROLES } from '../../utils/constants';
import { UserPlus, ArrowRight } from 'lucide-react';

export const Signup = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.EMPLOYEE
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const user = await signup({
        employeeId: formData.employeeId.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role
      });

      if (user.role === ROLES.HR_ADMIN) {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '0.25rem' }}>
        Create Dayflow Account
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '1.5rem' }}>
        Register your employee profile with your organization
      </p>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Employee ID</label>
          <input
            type="text"
            name="employeeId"
            className="form-control"
            placeholder="e.g. EMP-2026-099"
            value={formData.employeeId}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="firstName"
              className="form-control"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="lastName"
              className="form-control"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Work Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="john.doe@dayflow.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role Designation</label>
          <select
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value={ROLES.EMPLOYEE}>Standard Employee</option>
            <option value={ROLES.HR_ADMIN}>HR / Administrative Lead</option>
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          style={{ width: '100%', marginTop: '0.75rem' }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register Profile'}
          <ArrowRight size={18} />
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
        Already registered?{' '}
        <Link to="/login" style={{ color: 'var(--primary-600)', fontWeight: 700, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};
