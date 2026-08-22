import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { profileService } from '../../services/profileService';
import { AttendanceTable } from '../../components/attendance/AttendanceTable';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ATTENDANCE_STATUS } from '../../utils/constants';
import { Clock, Filter, Plus, Calendar } from 'lucide-react';

export const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Override Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideData, setOverrideData] = useState({
    userId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '17:30',
    status: ATTENDANCE_STATUS.PRESENT,
    remarks: 'Manual adjustment',
    overrideReason: 'Employee missed automated check-in'
  });
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedUser) params.userId = selectedUser;
      if (selectedDate) params.date = selectedDate;
      if (selectedDept && selectedDept !== 'ALL') params.department = selectedDept;
      if (selectedStatus && selectedStatus !== 'ALL') params.status = selectedStatus;

      const [attRes, empRes] = await Promise.all([
        attendanceService.getGlobalAttendance(params),
        profileService.getAllEmployees()
      ]);

      if (attRes.success) setRecords(attRes.data);
      if (empRes.success) setEmployees(empRes.data);
    } catch (e) {
      console.error('Failed to load attendance records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedUser, selectedDate, selectedDept, selectedStatus]);

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideData.userId) {
      setErrorMsg('Please select an employee.');
      return;
    }

    setOverrideSubmitting(true);
    setErrorMsg('');

    try {
      const res = await attendanceService.manualOverride({
        ...overrideData,
        userId: Number(overrideData.userId)
      });

      if (res.success) {
        setFeedbackMsg('Attendance record manually adjusted with full audit record.');
        setOverrideModalOpen(false);
        loadData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to override attendance.');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Company Attendance Management</h1>
          <p className="page-subtitle">Inspect workforce clock-ins, filter by department, and perform manual auditable overrides</p>
        </div>

        <button className="btn btn-primary" onClick={() => setOverrideModalOpen(true)}>
          <Plus size={16} />
          <span>Manual Attendance Override</span>
        </button>
      </div>

      {feedbackMsg && <Alert type="success" message={feedbackMsg} onClose={() => setFeedbackMsg('')} />}
      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Employee Filter */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Employee</label>
            <select
              className="form-control"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.userId || emp.id} value={emp.userId || emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div style={{ minWidth: '150px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Date</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div style={{ minWidth: '160px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Department</label>
            <select
              className="form-control"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '140px' }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Status</label>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value={ATTENDANCE_STATUS.PRESENT}>Present</option>
              <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
              <option value={ATTENDANCE_STATUS.HALF_DAY}>Half Day</option>
              <option value={ATTENDANCE_STATUS.LEAVE}>Leave</option>
            </select>
          </div>

          {(selectedUser || selectedDate || selectedDept || selectedStatus) && (
            <div style={{ alignSelf: 'flex-end' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedUser('');
                  setSelectedDate('');
                  setSelectedDept('');
                  setSelectedStatus('');
                }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text="Fetching company attendance records..." />
        ) : (
          <AttendanceTable
            records={records}
            showEmployeeName={true}
          />
        )}
      </div>

      {/* Manual Attendance Override Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Force Manual Attendance Override"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setOverrideModalOpen(false)} disabled={overrideSubmitting}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleOverrideSubmit} disabled={overrideSubmitting}>
              {overrideSubmitting ? 'Overriding...' : 'Save Manual Record'}
            </button>
          </>
        }
      >
        <form onSubmit={handleOverrideSubmit}>
          <div className="form-group">
            <label className="form-label">Select Employee</label>
            <select
              className="form-control"
              value={overrideData.userId}
              onChange={(e) => setOverrideData({ ...overrideData, userId: e.target.value })}
              required
            >
              <option value="">-- Choose Employee --</option>
              {employees.map((emp) => (
                <option key={emp.userId || emp.id} value={emp.userId || emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Attendance Date</label>
              <input
                type="date"
                className="form-control"
                value={overrideData.date}
                onChange={(e) => setOverrideData({ ...overrideData, date: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Attendance Status</label>
              <select
                className="form-control"
                value={overrideData.status}
                onChange={(e) => setOverrideData({ ...overrideData, status: e.target.value })}
                required
              >
                <option value={ATTENDANCE_STATUS.PRESENT}>Present</option>
                <option value={ATTENDANCE_STATUS.HALF_DAY}>Half Day</option>
                <option value={ATTENDANCE_STATUS.ABSENT}>Absent</option>
                <option value={ATTENDANCE_STATUS.LEAVE}>Leave</option>
              </select>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Check-In Time</label>
              <input
                type="time"
                className="form-control"
                value={overrideData.checkInTime}
                onChange={(e) => setOverrideData({ ...overrideData, checkInTime: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Check-Out Time</label>
              <input
                type="time"
                className="form-control"
                value={overrideData.checkOutTime}
                onChange={(e) => setOverrideData({ ...overrideData, checkOutTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Auditable Override Reason (Required)</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="State reason for manual adjustment (e.g. biometric machine glitch, employee forgot clock)..."
              value={overrideData.overrideReason}
              onChange={(e) => setOverrideData({ ...overrideData, overrideReason: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">General Remarks</label>
            <input
              type="text"
              className="form-control"
              value={overrideData.remarks}
              onChange={(e) => setOverrideData({ ...overrideData, remarks: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
