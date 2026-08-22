import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceCalendar } from '../../components/attendance/AttendanceCalendar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { formatTime, formatHours } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const EmployeeCalendar = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getMyCalendar(year, month);
      if (res.success) {
        setRecords(res.data);
      }
    } catch (e) {
      console.error('Failed to load calendar records', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSelectDate = (day, record) => {
    setSelectedDay(day);
    setSelectedRecord(record || null);
    setModalOpen(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Personal Attendance Calendar</h1>
          <p className="page-subtitle">Monthly visual calendar of your attendance and leaves</p>
        </div>

        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '0.375rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrevMonth}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', minWidth: '140px', textAlign: 'center' }}>
            {monthNames[month - 1]} {year}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={handleNextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner text="Loading month calendar..." />
        ) : (
          <AttendanceCalendar
            year={year}
            month={month}
            records={records}
            onSelectDate={handleSelectDate}
          />
        )}
      </div>

      {/* Selected Day Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Attendance Detail: ${monthNames[month - 1]} ${selectedDay}, ${year}`}
        footer={
          <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
            Close
          </button>
        }
      >
        {selectedRecord ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Status:</span>
              <Badge status={selectedRecord.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Check In Time:</span>
              <strong>{formatTime(selectedRecord.checkInTime)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Check Out Time:</span>
              <strong>{formatTime(selectedRecord.checkOutTime)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Total Worked Hours:</span>
              <strong style={{ color: 'var(--primary-700)', fontSize: '1.125rem' }}>
                {formatHours(selectedRecord.totalWorkedHours)}
              </strong>
            </div>
            {selectedRecord.remarks && (
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>Remarks:</span>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--slate-800)' }}>
                  {selectedRecord.remarks}
                </p>
              </div>
            )}
            {selectedRecord.manuallyOverridden && (
              <div style={{ backgroundColor: 'var(--warning-50)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--warning-700)' }}>
                <strong>Manually Overridden by HR:</strong> {selectedRecord.overrideReason}
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--slate-500)' }}>
            No attendance activity or leave recorded for this date.
          </div>
        )}
      </Modal>
    </div>
  );
};
