import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';
import { ROLES } from '../../utils/constants';
import { ArrowLeft, Save, ShieldAlert, User, Briefcase, DollarSign } from 'lucide-react';

export const AdminEmployeeDetail = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    homeAddress: '',
    dateOfBirth: '',
    profilePictureUrl: '',
    department: '',
    designation: '',
    joiningDate: '',
    employmentType: 'FULL_TIME',
    reportingManager: '',
    basicPay: 0,
    allowances: 0,
    taxDeduction: 0,
    pfDeduction: 0,
    role: ROLES.EMPLOYEE,
    emailVerified: true
  });

  const loadEmployee = async () => {
    try {
      const res = await profileService.getEmployeeById(employeeId);
      if (res.success) {
        setEmployee(res.data);
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          phoneNumber: res.data.phoneNumber || '',
          homeAddress: res.data.homeAddress || '',
          dateOfBirth: res.data.dateOfBirth || '',
          profilePictureUrl: res.data.profilePictureUrl || '',
          department: res.data.department || '',
          designation: res.data.designation || '',
          joiningDate: res.data.joiningDate || '',
          employmentType: res.data.employmentType || 'FULL_TIME',
          reportingManager: res.data.reportingManager || '',
          basicPay: res.data.basicPay || 0,
          allowances: res.data.allowances || 0,
          taxDeduction: res.data.taxDeduction || 0,
          pfDeduction: res.data.pfDeduction || 0,
          role: res.data.role || ROLES.EMPLOYEE,
          emailVerified: res.data.emailVerified ?? true
        });
      }
    } catch (err) {
      setError('Failed to load employee details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployee();
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await profileService.adminOverrideProfile(employeeId, {
        ...formData,
        basicPay: Number(formData.basicPay),
        allowances: Number(formData.allowances),
        taxDeduction: Number(formData.taxDeduction),
        pfDeduction: Number(formData.pfDeduction)
      });

      if (res.success) {
        setSuccessMsg('Employee profile fields overridden successfully by Admin.');
        setEmployee(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to override employee profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading employee profile..." />;

  const grossCalculated = Number(formData.basicPay) + Number(formData.allowances);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/employees')}>
          <ArrowLeft size={16} />
          <span>Back to Directory</span>
        </button>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Overriding...' : 'Save All Overrides'}</span>
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">
          Admin Override: {employee?.firstName} {employee?.lastName}
        </h1>
        <p className="page-subtitle">
          Administrative control panel for employee ID: <strong>{employee?.employeeId}</strong>
        </p>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Personal Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} color="var(--primary-600)" />
                <span>Personal & Identity Details</span>
              </h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-control"
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
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Work Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  className="form-control"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Home Address</label>
              <textarea
                name="homeAddress"
                className="form-control"
                rows={2}
                value={formData.homeAddress}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo URL</label>
              <input
                type="url"
                name="profilePictureUrl"
                className="form-control"
                value={formData.profilePictureUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Job & Organization */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={18} color="var(--primary-600)" />
                <span>Job & Organization Information</span>
              </h3>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  name="department"
                  className="form-control"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  name="designation"
                  className="form-control"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Employment Type</label>
                <select
                  name="employmentType"
                  className="form-control"
                  value={formData.employmentType}
                  onChange={handleChange}
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  className="form-control"
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reporting Manager</label>
              <input
                type="text"
                name="reportingManager"
                className="form-control"
                value={formData.reportingManager}
                onChange={handleChange}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">System Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value={ROLES.EMPLOYEE}>ROLE_EMPLOYEE</option>
                  <option value={ROLES.HR_ADMIN}>ROLE_HR_ADMIN</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                  <input
                    type="checkbox"
                    name="emailVerified"
                    checked={formData.emailVerified}
                    onChange={handleChange}
                  />
                  <span>Email Verified</span>
                </label>
              </div>
            </div>
          </div>

          {/* Salary Structure (Admin Overrides) */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">
              <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} color="var(--primary-600)" />
                <span>Salary Structure & Deductions Override</span>
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Basic Salary ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="basicPay"
                  className="form-control"
                  value={formData.basicPay}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Allowances ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="allowances"
                  className="form-control"
                  value={formData.allowances}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Deduction ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="taxDeduction"
                  className="form-control"
                  value={formData.taxDeduction}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Provident Fund ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="pfDeduction"
                  className="form-control"
                  value={formData.pfDeduction}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--primary-50)', padding: '0.875rem 1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-900)' }}>Total Calculated Monthly Gross Pay:</span>
              <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary-700)' }}>
                {formatCurrency(grossCalculated)}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
