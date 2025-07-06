'use client';

import { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../../lib/api';
import { Employee } from '../../types';
import socketManager from '../../socket';

const PunchStationPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPunching, setIsPunching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastAction, setLastAction] = useState<{
    employee: Employee;
    action: 'punch_in' | 'punch_out';
    time: Date;
  } | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadEmployees();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Setup WebSocket for real-time updates
    socketManager.connect();

    return () => {
      clearInterval(timeInterval);
      socketManager.unsubscribeAll();
    };
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getAll();
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePunch = async (employeeId: string, action: 'punch_in' | 'punch_out') => {
    setIsPunching(true);
    
    try {
      const response = await attendanceAPI.punch({ employeeId, action });
      
      if (response.success) {
        // Update local state
        const employee = employees.find(emp => emp._id === employeeId);
        if (employee) {
          setLastAction({
            employee,
            action,
            time: new Date()
          });
          
          // Update employee status in local state
          setEmployees(prev => prev.map(emp => 
            emp._id === employeeId 
              ? { ...emp, currentStatus: action === 'punch_in' ? 'checked_in' : 'checked_out' }
              : emp
          ));
        }
        
        // Clear selection after successful punch
        setTimeout(() => {
          setSelectedEmployee(null);
          setSearchTerm('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error punching:', error);
    } finally {
      setIsPunching(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const EmployeeCard = ({ employee }: { employee: Employee }) => (
    <div
      className={`bg-white rounded-2xl shadow-elegant p-6 cursor-pointer transition-all duration-300 border-2 ${
        selectedEmployee?._id === employee._id
          ? 'border-purple-500 ring-4 ring-purple-100 scale-105'
          : 'border-gray-200 hover:border-purple-300 hover:shadow-dramatic hover:scale-102'
      }`}
      onClick={() => setSelectedEmployee(employee)}
    >
      <div className="flex items-center space-x-4">
        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-soft ${
          employee.currentStatus === 'checked_in'
            ? 'bg-gradient-to-br from-green-500 to-emerald-600'
            : 'bg-gradient-to-br from-gray-400 to-gray-500'
        }`}>
          <span className="text-2xl text-white">👤</span>
          {employee.currentStatus === 'checked_in' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900">{employee.name}</h3>
          <p className="text-sm text-gray-600 font-medium">{employee.position}</p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              employee.currentStatus === 'checked_in'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {employee.currentStatus === 'checked_in' ? '🟢 Checked In' : '⚫ Checked Out'}
            </span>
          </div>
        </div>
        <div className="text-2xl text-purple-600">
          {selectedEmployee?._id === employee._id ? '✓' : '→'}
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ action, employee }: { action: 'punch_in' | 'punch_out'; employee: Employee }) => {
    const isDisabled = (action === 'punch_in' && employee.currentStatus === 'checked_in') ||
                      (action === 'punch_out' && employee.currentStatus === 'checked_out');
    
    return (
      <button
        onClick={() => handlePunch(employee._id, action)}
        disabled={isDisabled || isPunching}
        className={`flex-1 py-6 px-8 rounded-2xl text-xl font-bold transition-all duration-300 transform ${
          isDisabled
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : action === 'punch_in'
            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-105 shadow-elegant'
            : 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white hover:scale-105 shadow-elegant'
        } ${isPunching ? 'animate-pulse' : ''}`}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-3xl">
            {action === 'punch_in' ? '🟢' : '🔴'}
          </span>
          <span>
            {action === 'punch_in' ? 'CHECK IN' : 'CHECK OUT'}
          </span>
          <span className="text-sm opacity-90">
            {action === 'punch_in' ? 'Start your workday' : 'End your workday'}
          </span>
        </div>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/30 border-t-white"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">⏰</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl float"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-dramatic">
              <span className="text-5xl">🖥️</span>
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4">
            Punch Station
          </h1>
          <p className="text-2xl text-white/90 mb-6">
            Employee Check-In & Check-Out System
          </p>
          
          {/* Live Clock */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/20 shadow-dramatic">
            <div className="text-4xl font-bold text-white mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-lg text-white/80">
              {formatDate(currentTime)}
            </div>
          </div>
        </div>

        {/* Last Action Success */}
        {lastAction && (
          <div className="fixed top-8 right-8 bg-white rounded-2xl shadow-dramatic p-6 z-50 border-l-4 border-green-500 max-w-sm animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <span className="text-2xl text-white">✓</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{lastAction.employee.name}</p>
                <p className="text-sm text-gray-600">
                  {lastAction.action === 'punch_in' ? '🟢 Checked In' : '🔴 Checked Out'}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTime(lastAction.time)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Employee Selection */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-dramatic">
              <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <span className="text-xl">👥</span>
                </span>
                Select Employee
              </h3>
              
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by name or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl text-white placeholder-white/70 focus:border-white focus:ring-4 focus:ring-white/20 transition-all duration-300"
                />
              </div>

              {/* Employee List */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(employee => (
                    <EmployeeCard key={employee._id} employee={employee} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🔍</span>
                    </div>
                    <p className="text-white/80 text-lg">
                      {searchTerm ? 'No employees found matching your search' : 'No employees available'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Punch Actions */}
          <div className="space-y-6">
            {selectedEmployee ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-dramatic">
                <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
                  <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl">⏰</span>
                  </span>
                  Punch Actions
                </h3>

                {/* Selected Employee Info */}
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-soft ${
                      selectedEmployee.currentStatus === 'checked_in'
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      <span className="text-2xl text-white">👤</span>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white">{selectedEmployee.name}</h4>
                      <p className="text-lg text-white/80">{selectedEmployee.position}</p>
                      <p className="text-sm text-white/70">
                        Current Status: {selectedEmployee.currentStatus === 'checked_in' ? '🟢 Checked In' : '⚫ Checked Out'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <ActionButton action="punch_in" employee={selectedEmployee} />
                  <ActionButton action="punch_out" employee={selectedEmployee} />
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/20">
                  <p className="text-white/80 text-center text-sm">
                    {selectedEmployee.currentStatus === 'checked_in' 
                      ? '✅ Currently working - Use CHECK OUT when leaving'
                      : '⏰ Not currently working - Use CHECK IN when starting'
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 shadow-dramatic text-center">
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👈</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Select an Employee</h3>
                <p className="text-xl text-white/80 mb-8">
                  Choose an employee from the list to proceed with check-in or check-out
                </p>
                <div className="space-y-3 text-white/70">
                  <p className="flex items-center justify-center">
                    <span className="w-6 h-6 bg-green-500 rounded-full mr-3 flex items-center justify-center text-xs">✓</span>
                    Find your name in the employee list
                  </p>
                  <p className="flex items-center justify-center">
                    <span className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-xs">2</span>
                    Click on your name to select
                  </p>
                  <p className="flex items-center justify-center">
                    <span className="w-6 h-6 bg-purple-500 rounded-full mr-3 flex items-center justify-center text-xs">3</span>
                    Choose Check In or Check Out
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <p className="text-white/60 text-sm">
              💄 Parlour Attendance System • Secure & Real-time • 
              <span className="mx-2">•</span>
              Current Time: {formatTime(currentTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunchStationPage;
