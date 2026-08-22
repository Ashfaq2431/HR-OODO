import React, { useState, useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { User, Phone, MapPin, Briefcase, DollarSign, FileText, Lock, Save } from 'lucide-react';

export const EmployeeProfile = () => {
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields for employee
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const loadProfile = async () => {
    try {
      const [pRes, dRes] = await Promise.all([
        profileService.getMyProfile(),
        profileService.getMyDocuments()
      ]);

      if (pRes.success) {
        setProfile(pRes.data);
        setPhoneNumber(pRes.data.phoneNumber || '');
        setHomeAddress(pRes.data.homeAddress || '');
        setProfilePictureUrl(pRes.data.profilePictureUrl || '');
      }
      if (dRes.success) {
        setDocuments(dRes.data);
      }
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await profileService.updateMyProfile({
        phoneNumber: phoneNumber.trim(),
        homeAddress: homeAddress.trim(),
        profilePictureUrl: profilePictureUrl.trim()
      });

      if (res.success) {
        setSuccessMsg('Personal contact details updated successfully.');
        setProfile(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="page-title">My Employee Profile</h1>
        <p className="page-subtitle">View and update your personal and contact details</p>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Header Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <img
          src={profile?.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
          alt="Profile"
          style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-100)' }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
            {profile?.firstName} {profile?.lastName}
          </h2>
          <div style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {profile?.designation} • {profile?.department}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
            <span>ID: <strong>{profile?.employeeId}</strong></span>
            <span>Joined: <strong>{formatDate(profile?.joiningDate)}</strong></span>
            <span>Type: <strong>{profile?.employmentType}</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Sections Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Section 1: Personal Details (Editable) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary-600)" />
              <span>Personal Details (Editable)</span>
            </h3>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-control" value={profile?.firstName || ''} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-control" value={profile?.lastName || ''} disabled />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input type="email" className="form-control" value={profile?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Editable)</label>
              <input
                type="text"
                className="form-control"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Home Address (Editable)</label>
              <textarea
                className="form-control"
                rows={2}
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                placeholder="Residential street address..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Picture URL (Editable)</label>
              <input
                type="url"
                className="form-control"
                value={profilePictureUrl}
                onChange={(e) => setProfilePictureUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Update Contact Info'}</span>
            </button>
          </form>
        </div>

        {/* Section 2: Job Information (Read Only) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} color="var(--primary-600)" />
              <span>Job Details (Read Only)</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={12} /> HR Controlled
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input type="text" className="form-control" value={profile?.department || '—'} disabled />
          </div>

          <div className="form-group">
            <label className="form-label">Designation</label>
            <input type="text" className="form-control" value={profile?.designation || '—'} disabled />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <input type="text" className="form-control" value={profile?.employmentType || 'FULL_TIME'} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Joining Date</label>
              <input type="text" className="form-control" value={formatDate(profile?.joiningDate)} disabled />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reporting Manager</label>
            <input type="text" className="form-control" value={profile?.reportingManager || '—'} disabled />
          </div>
        </div>

        {/* Section 3: Salary Structure (Read Only) */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={18} color="var(--primary-600)" />
              <span>Salary Structure (Read Only)</span>
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={12} /> HR Controlled
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Basic Salary</label>
              <input type="text" className="form-control" value={formatCurrency(profile?.basicPay)} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Allowances</label>
              <input type="text" className="form-control" value={formatCurrency(profile?.allowances)} disabled />
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--success-50)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--success-700)' }}>Gross Base Pay:</span>
            <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--success-700)' }}>
              {formatCurrency(profile?.grossPay)}
            </span>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Standard Tax Withholding</label>
              <input type="text" className="form-control" value={formatCurrency(profile?.taxDeduction)} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Provident Fund (PF)</label>
              <input type="text" className="form-control" value={formatCurrency(profile?.pfDeduction)} disabled />
            </div>
          </div>
        </div>

        {/* Section 4: Employment Documents */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} color="var(--primary-600)" />
              <span>Verified Documents</span>
            </h3>
          </div>

          {documents.length === 0 ? (
            <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 1rem' }}>
              No official documents uploaded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    backgroundColor: 'var(--slate-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={20} color="var(--primary-600)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{doc.documentName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Type: {doc.documentType}</div>
                    </div>
                  </div>
                  <a
                    href={doc.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
