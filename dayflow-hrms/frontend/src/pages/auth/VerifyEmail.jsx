import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setError('Verification token is missing from the link.');
        setLoading(false);
        return;
      }

      try {
        const res = await authService.verifyEmail(token);
        if (res.success) {
          setSuccess(true);
        }
      } catch (err) {
        setError(err.message || 'Verification link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token]);

  return (
    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
      {loading && (
        <div>
          <Loader2 size={48} color="var(--primary-600)" style={{ animation: 'spin 1s linear infinite' }} />
          <h3 style={{ marginTop: '1rem', fontSize: '1.125rem' }}>Verifying your email...</h3>
        </div>
      )}

      {!loading && success && (
        <div>
          <CheckCircle2 size={56} color="var(--success-500)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Email Verified Successfully!
          </h3>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Thank you for verifying your Dayflow HRMS work account. You can now access all portal features.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            Proceed to Login
          </Link>
        </div>
      )}

      {!loading && !success && (
        <div>
          <XCircle size={56} color="var(--danger-500)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--slate-900)' }}>
            Verification Failed
          </h3>
          <p style={{ color: 'var(--danger-700)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
            Return to Login
          </Link>
        </div>
      )}
    </div>
  );
};
