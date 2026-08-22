import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../../services/profileService';
import { SalaryStructureModal } from '../../components/payroll/SalaryStructureModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Users, Search, Filter, Edit, DollarSign, ArrowRight } from 'lucide-react';

export const AdminEmployees = () => {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const [salaryModalOpen, setSalaryModalOpen] = useState(false);
  const [selectedEmployeeForSalary, setSelectedEmployeeForSalary] = useState(null);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await profileService.getAllEmployees(departmentFilter);
      if (res.success) {
        setEmployees(res.data);
      }
    } catch (e) {
      console.error('Failed to load employees', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [departmentFilter]);

  const filteredEmployees = employees.filter((emp) => {
    const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const id = (emp.employeeId || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  const handleEditSalary = (emp) => {
    setSelectedEmployeeForSalary(emp);
    setSalaryModalOpen(true);
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Employee Directory & Management</h1>
          <p className="page-subtitle">Manage company workforce records, designations, and salary structures</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search employee by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} color="var(--slate-500)" />
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product Design">Product Design</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Human Resources">Human Resources</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        {loading ? (
          <LoadingSpinner text="Fetching employee records..." />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Gross Base Salary</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id || emp.userId}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.profilePictureUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt=""
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                            {emp.employeeId} • {emp.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{emp.designation || '—'}</td>
                    <td>{formatDate(emp.joiningDate)}</td>
                    <td style={{ fontWeight: 700, color: 'var(--success-700)' }}>
                      {formatCurrency(emp.grossPay)}
                    </td>
                    <td>
                      <Badge status={emp.role} />
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          title="Edit Salary Structure"
                          onClick={() => handleEditSalary(emp)}
                        >
                          <DollarSign size={14} />
                          <span>Salary</span>
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          title="Full Profile Override"
                          onClick={() => navigate(`/admin/employees/${emp.userId || emp.id}`)}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Salary Structure Modal */}
      <SalaryStructureModal
        isOpen={salaryModalOpen}
        onClose={() => setSalaryModalOpen(false)}
        employee={selectedEmployeeForSalary}
        onSuccess={() => loadEmployees()}
      />
    </div>
  );
};
