'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { employeeAPI } from '../../../lib/api';
import { isSuperAdmin } from '../../../utils/auth';
import { Employee } from '../../../types';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  address: string;
  dateOfBirth: string;
  salary: number;
  emergencyContact: string;
}

interface DeleteModalData {
  employee: Employee;
  reasonForLeaving: string;
  performanceRating: number;
}

const EmployeesPage = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<DeleteModalData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    address: '',
    dateOfBirth: '',
    salary: 0,
    emergencyContact: '',
  });

  const isSuper = isSuperAdmin();
  const positions = ['Hair Stylist', 'Nail Technician', 'Makeup Artist', 'Massage Therapist', 'Receptionist', 'Manager'];
  const departments = ['Hair', 'Nails', 'Makeup', 'Massage', 'Reception', 'Management'];

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getAll();
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuper) return;

    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await employeeAPI.update(editingEmployee._id, formData);
        if (response.success) {
          await loadEmployees();
          resetForm();
        }
      } else {
        // Create new employee
        const response = await employeeAPI.create(formData);
        if (response.success) {
          await loadEmployees();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  const handleEdit = (employee: Employee) => {
    if (!isSuper) return;
    
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
      salary: employee.salary || 0,
      emergencyContact: employee.emergencyContact || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (employee: Employee) => {
    if (!isSuper) return;

    // Check if employee is marked as leaving
    if (employee.isLeaving) {
      // Show modal for leaving employee
      setDeleteModalData({
        employee,
        reasonForLeaving: '',
        performanceRating: 3,
      });
      setIsDeleteModalOpen(true);
    } else {
      // Regular delete for non-leaving employees
      if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return;

      try {
        const response = await employeeAPI.delete(employee._id);
        if (response.success) {
          await loadEmployees();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee');
      }
    }
  };

  const handleMoveToArchive = async () => {
    if (!deleteModalData || !isSuper) return;

    try {
      setIsDeleting(true);
      const response = await employeeAPI.moveToPreviousStaff(deleteModalData.employee._id, {
        reasonForLeaving: deleteModalData.reasonForLeaving,
        performanceRating: deleteModalData.performanceRating,
      });

      if (response.success) {
        await loadEmployees();
        setIsDeleteModalOpen(false);
        setDeleteModalData(null);
        
        // Show detailed success message with salary info
        const salaryData = response.data?.salaryData;
        if (salaryData) {
          alert(`Employee has been moved to previous staff records and deleted from active database.\n\nSalary Summary:\n- Total Income: $${salaryData.totalIncome.toLocaleString()}\n- Paid Income: $${salaryData.paidIncome.toLocaleString()}\n- Pending Income: $${salaryData.pendingIncome.toLocaleString()}`);
        } else {
          alert('Employee has been moved to previous staff records and deleted from active database.');
        }
      }
    } catch (error) {
      console.error('Error moving employee to archive:', error);
      alert('Failed to move employee to archive');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManualCleanup = async () => {
    if (!isSuper) return;

    const confirmCleanup = confirm('This will process all employees who have already left and move them to the archive. Continue?');
    if (!confirmCleanup) return;

    try {
      setIsCleaningUp(true);
      const response = await employeeAPI.manualCleanupLeftEmployees();

      if (response.success && response.data) {
        await loadEmployees();
        
        const { processedCount, processedEmployees } = response.data;
        
        if (processedCount === 0) {
          alert('No employees found that needed to be cleaned up.');
        } else {
          let message = `Successfully processed ${processedCount} left employee(s):\n\n`;
          processedEmployees.forEach((emp: { name: string; totalIncome: number }) => {
            message += `• ${emp.name} - Total Income: $${emp.totalIncome.toLocaleString()}\n`;
          });
          alert(message);
        }
      }
    } catch (error) {
      console.error('Error during manual cleanup:', error);
      alert('Failed to cleanup left employees');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: '',
      department: '',
      address: '',
      dateOfBirth: '',
      salary: 0,
      emergencyContact: '',
    });
    setEditingEmployee(null);
    setIsModalOpen(false);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === 'all' || employee.position === positionFilter;
    const matchesStatus = statusFilter === 'all' || employee.currentStatus === statusFilter;
    
    return matchesSearch && matchesPosition && matchesStatus;
  });

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div className={`bg-white rounded-2xl shadow-elegant p-6 card-hover border group ${
      employee.isLeaving ? 'border-orange-200 bg-orange-50' : 'border-gray-100'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-soft ${
            employee.isLeaving 
              ? 'bg-gradient-to-br from-orange-500 to-red-500'
              : employee.currentStatus === 'checked_in' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
          }`}>
            <span className="text-2xl text-white">
              {employee.isLeaving ? '👋' : '👤'}
            </span>
            {employee.currentStatus === 'checked_in' && !employee.isLeaving && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
              {employee.name}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{employee.position}</p>
            <p className="text-xs text-gray-500">{employee.email}</p>
            {employee.isLeaving && employee.leavingDate && (
              <p className="text-xs text-orange-600 font-medium mt-1">
                Leaving: {new Date(employee.leavingDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="text-right">
          {employee.isLeaving ? (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">
              🚪 Leaving
            </span>
          ) : (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              employee.currentStatus === 'checked_in'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {employee.currentStatus === 'checked_in' ? '🟢 Online' : '⚫ Offline'}
            </span>
          )}
          {employee.lastPunchIn && !employee.isLeaving && (
            <p className="text-xs text-gray-500 mt-2">
              Last punch: {new Date(employee.lastPunchIn).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📞</span>
          {employee.phone}
        </div>
        {employee.address && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">📍</span>
            {employee.address}
          </div>
        )}
        {employee.salary && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">💰</span>
            ${employee.salary.toLocaleString()}/month
          </div>
        )}
      </div>

      {isSuper && (
        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleEdit(employee)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(employee)}
            className={`flex-1 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 ${
              employee.isLeaving 
                ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            }`}
          >
            {employee.isLeaving ? '📁 Archive' : '🗑️ Delete'}
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-2xl text-white">👥</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Employee Management</h1>
              <p className="text-lg text-gray-600">Manage your parlour staff</p>
            </div>
          </div>

          {isSuper && (
            <div className="flex space-x-3">
              <button
                onClick={handleManualCleanup}
                disabled={isCleaningUp}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center space-x-2 shadow-elegant transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-xl">🧹</span>
                <span>{isCleaningUp ? 'Processing...' : 'Cleanup Left Employees'}</span>
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="btn-primary flex items-center space-x-2 shadow-elegant"
              >
                <span className="text-xl">➕</span>
                <span>Add Employee</span>
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">👥</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
                <p className="text-sm text-gray-600">Total Employees</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {employees.filter(emp => emp.currentStatus === 'checked_in').length}
                </p>
                <p className="text-sm text-gray-600">Currently Online</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(employees.map(emp => emp.position)).size}
                </p>
                <p className="text-sm text-gray-600">Unique Positions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((employees.filter(emp => emp.currentStatus === 'checked_in').length / employees.length) * 100) || 0}%
                </p>
                <p className="text-sm text-gray-600">Attendance Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              >
                <option value="all">All Positions</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              >
                <option value="all">All Statuses</option>
                <option value="checked_in">Online</option>
                <option value="checked_out">Offline</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setPositionFilter('all');
                  setStatusFilter('all');
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">👥</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || positionFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by adding your first employee.'
              }
            </p>
            {isSuper && !searchTerm && positionFilter === 'all' && statusFilter === 'all' && (
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="btn-primary"
              >
                ➕ Add First Employee
              </button>
            )}
          </div>
        )}

        {/* Employee Modal */}
        {isModalOpen && isSuper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-dramatic max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-modern"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-modern"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input-modern"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position *</label>
                    <select
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="input-modern"
                    >
                      <option value="">Select position</option>
                      {positions.map(position => (
                        <option key={position} value={position}>{position}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department *</label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input-modern"
                    >
                      <option value="">Select department</option>
                      {departments.map(department => (
                        <option key={department} value={department}>{department}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="input-modern"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Monthly Salary</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="input-modern"
                      placeholder="5000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input-modern h-24 resize-none"
                    placeholder="Enter complete address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Contact</label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="input-modern"
                    placeholder="Emergency contact number"
                  />
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingEmployee ? 'Update Employee' : 'Add Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && isSuper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-dramatic max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {deleteModalData?.employee.name}
                  </h3>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleMoveToArchive(); }} className="p-6 space-y-6">
                {/* Salary Summary */}
                {deleteModalData?.employee.salaryHistory && deleteModalData.employee.salaryHistory.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white text-sm">💰</span>
                      </span>
                      Salary Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Salary Records</p>
                        <p className="text-xl font-bold text-blue-600">
                          {deleteModalData.employee.salaryHistory.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold text-green-600">
                          ${deleteModalData.employee.salaryHistory.reduce((total, record) => total + (record.amount || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Paid Amount</p>
                        <p className="text-xl font-bold text-purple-600">
                          ${deleteModalData.employee.salaryHistory
                            .filter(record => record.status === 'paid')
                            .reduce((total, record) => total + (record.amount || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-600">
                        All salary history will be preserved in the archive
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Leaving</label>
                  <textarea
                    value={deleteModalData?.reasonForLeaving || ''}
                    onChange={(e) => deleteModalData && setDeleteModalData({ ...deleteModalData, reasonForLeaving: e.target.value })}
                    className="input-modern h-24 resize-none"
                    placeholder="Enter reason for leaving"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Performance Rating</label>
                  <select
                    value={deleteModalData?.performanceRating || 3}
                    onChange={(e) => deleteModalData && setDeleteModalData({ ...deleteModalData, performanceRating: Number(e.target.value) })}
                    className="input-modern"
                  >
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Below Average</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Moving to Archive...' : 'Move to Archive'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
