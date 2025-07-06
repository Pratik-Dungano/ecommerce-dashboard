'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { attendanceAPI, employeeAPI } from '../../../lib/api';
import { Attendance, Employee } from '../../../types';
import socketManager from '../../../socket';

interface AttendanceStats {
  todayTotal: number;
  presentEmployees: number;
  totalEmployees: number;
  averageHours: number;
  lateArrivals: number;
  earlyDepartures: number;
}

const AttendancePage = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    todayTotal: 0,
    presentEmployees: 0,
    totalEmployees: 0,
    averageHours: 0,
    lateArrivals: 0,
    earlyDepartures: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [realtimeUpdates, setRealtimeUpdates] = useState<Attendance[]>([]);

  useEffect(() => {
    loadData();
    
    // Setup WebSocket for real-time updates
    socketManager.connect();
    socketManager.subscribeToAttendance((data) => {
      console.log('Real-time attendance update:', data);
      setRealtimeUpdates(prev => [data, ...prev.slice(0, 4)]); // Keep last 5 updates
      loadData(); // Refresh all data when attendance changes
    });

    return () => {
      socketManager.unsubscribeAll();
    };
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadAttendance(),
        loadEmployees(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await attendanceAPI.getToday();
      if (response.success && response.data?.attendance) {
        const attendanceData = response.data.attendance;
        setAttendance(attendanceData);
        
        // Calculate stats
        const todayTotal = attendanceData.length;
        const presentEmployees = attendanceData.filter(record => 
          record.action === 'punch_in' && 
          !attendanceData.some(r => 
            r.employee._id === record.employee._id && 
            r.action === 'punch_out' && 
            new Date(r.timestamp) > new Date(record.timestamp)
          )
        ).length;

        setStats(prev => ({
          ...prev,
          todayTotal,
          presentEmployees,
        }));
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.success && response.data?.employees) {
        const employeesData = response.data.employees;
        setEmployees(employeesData);
        
        setStats(prev => ({
          ...prev,
          totalEmployees: employeesData.length,
        }));
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || record.action === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getEmployeeCurrentStatus = (employeeId: string) => {
    const employeeRecords = attendance
      .filter(record => record.employee._id === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return employeeRecords[0]?.action === 'punch_in' ? 'checked_in' : 'checked_out';
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (checkIn: string, checkOut?: string) => {
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // minutes
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    return `${hours}h ${minutes}m`;
  };

  const StatCard = ({ title, value, subtitle, icon, gradient, trend }: any) => (
    <div className={`relative bg-white rounded-2xl shadow-elegant p-6 card-hover overflow-hidden group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-soft`}>
            <span className="text-2xl text-white">{icon}</span>
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-green-600">
              <span className="text-sm font-medium">↗</span>
              <span className="text-xs">Live</span>
            </div>
          )}
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );

  const AttendanceRecord = ({ record }: { record: Attendance }) => (
    <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-soft ${
            record.action === 'punch_in' 
              ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          }`}>
            <span className="text-xl text-white">👤</span>
          </div>
          <div>
            <h4 className="text-lg font-bold text-gray-900">{record.employee.name}</h4>
            <p className="text-sm text-gray-600 font-medium">{record.employee.position}</p>
          </div>
        </div>
        
        <div className="text-right">
          <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
            record.action === 'punch_in' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {record.action === 'punch_in' ? '🟢 CHECKED IN' : '🔴 CHECKED OUT'}
          </span>
          <p className="text-sm text-gray-500 mt-2 font-medium">
            {formatTime(record.timestamp)}
          </p>
          {record.notes && (
            <p className="text-xs text-gray-400 mt-1">📝 {record.notes}</p>
          )}
        </div>
      </div>
    </div>
  );

  const RealtimeUpdate = ({ update }: { update: Attendance }) => (
    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-l-4 border-purple-500 animate-pulse">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">⚡</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{update.employee.name}</p>
          <p className="text-sm text-gray-600">
            {update.action === 'punch_in' ? '🟢 Just checked in' : '🔴 Just checked out'} • {formatTime(update.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">⏰</span>
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
              <span className="text-2xl text-white">⏰</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Attendance Dashboard</h1>
              <p className="text-lg text-gray-600">Real-time attendance monitoring</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Updates</span>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Records"
            value={stats.todayTotal}
            icon="📊"
            gradient="from-blue-500 to-blue-600"
            subtitle="Total punch records"
            trend={true}
          />
          <StatCard
            title="Present Now"
            value={stats.presentEmployees}
            icon="✅"
            gradient="from-green-500 to-emerald-600"
            subtitle="Currently checked in"
            trend={true}
          />
          <StatCard
            title="Total Staff"
            value={stats.totalEmployees}
            icon="👥"
            gradient="from-purple-500 to-purple-600"
            subtitle="Active employees"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.totalEmployees > 0 ? Math.round((stats.presentEmployees / stats.totalEmployees) * 100) : 0}%`}
            icon="📈"
            gradient="from-orange-500 to-amber-600"
            subtitle="Current presence"
            trend={true}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Attendance Records - Spans 3 columns */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Action Filter</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                  >
                    <option value="all">All Actions</option>
                    <option value="punch_in">Check Ins</option>
                    <option value="punch_out">Check Outs</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterStatus('all');
                    }}
                    className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    🔄 Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Records */}
            <div className="bg-white rounded-2xl shadow-elegant p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📋</span>
                  </span>
                  Attendance Records
                </h3>
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-2 rounded-full font-semibold">
                  {filteredAttendance.length} records
                </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((record) => (
                      <AttendanceRecord key={record._id} record={record} />
                    ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-gray-400">📅</span>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No attendance records found</p>
                    <p className="text-gray-400 text-sm">Records will appear here as employees check in/out</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Real-time Updates */}
          <div className="space-y-6">
            {/* Real-time Updates */}
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚡</span>
                </span>
                Live Updates
              </h3>
              
              <div className="space-y-4">
                {realtimeUpdates.length > 0 ? (
                  realtimeUpdates.map((update, index) => (
                    <RealtimeUpdate key={`${update._id}-${index}`} update={update} />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl text-gray-400">👁️</span>
                    </div>
                    <p className="text-gray-500 text-sm">Waiting for updates...</p>
                    <p className="text-gray-400 text-xs">Real-time changes will appear here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Current Status Summary */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-elegant">
              <h4 className="font-bold text-lg mb-4 flex items-center">
                <span className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-sm">👥</span>
                </span>
                Staff Status
              </h4>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Present</span>
                  <span className="font-bold text-xl">{stats.presentEmployees}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Absent</span>
                  <span className="font-bold text-xl">{stats.totalEmployees - stats.presentEmployees}</span>
                </div>
                <div className="h-px bg-white/20 my-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-100">Total Staff</span>
                  <span className="font-bold text-xl">{stats.totalEmployees}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Attendance Rate</span>
                  <span className="font-semibold">
                    {stats.totalEmployees > 0 ? Math.round((stats.presentEmployees / stats.totalEmployees) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${stats.totalEmployees > 0 ? (stats.presentEmployees / stats.totalEmployees) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h4 className="font-bold text-lg text-gray-900 mb-4">Quick Actions</h4>
              <div className="space-y-3">
                <a
                  href="/attendance"
                  className="block w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-center py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  🖥️ Punch Station
                </a>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                >
                  🔄 Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
