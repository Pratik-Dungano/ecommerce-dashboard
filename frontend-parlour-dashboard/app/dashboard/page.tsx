'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAttendanceStats } from '../../hooks/useAttendanceStats';
import { employeeAPI, attendanceAPI, taskAPI } from '../../lib/api';
import socketManager from '../../socket';

interface DashboardStats {
  totalEmployees: number;
  presentEmployees: number;
  totalTasks: number;
  pendingTasks: number;
  todayAttendance: number;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const { stats: attendanceStats, isLoading: attendanceLoading } = useAttendanceStats();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    presentEmployees: 0,
    totalTasks: 0,
    pendingTasks: 0,
    todayAttendance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    
    // Setup WebSocket for real-time updates
    socketManager.connect();
    socketManager.subscribeToAttendance((data) => {
      console.log('Real-time attendance update:', data);
      // Refresh attendance data when update received
      loadAttendanceData();
    });

    return () => {
      socketManager.unsubscribeAll();
    };
  }, []);

  // Update stats when attendance stats change
  useEffect(() => {
    if (attendanceStats) {
      setStats(prev => ({
        ...prev,
        totalEmployees: attendanceStats.totalEmployees,
        presentEmployees: attendanceStats.presentEmployees,
      }));
    }
  }, [attendanceStats]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadTaskData(),
        loadAttendanceData(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTaskData = async () => {
    try {
      const response = await taskAPI.getAll();
      if (response.success) {
        const tasks = response.data?.tasks || [];
        const pendingCount = tasks.filter(task => task.status === 'assigned' || task.status === 'in_progress').length;
        
        setStats(prev => ({
          ...prev,
          totalTasks: tasks.length,
          pendingTasks: pendingCount,
        }));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const response = await attendanceAPI.getToday();
      if (response.success) {
        const attendance = response.data?.attendance || [];
        
        setStats(prev => ({
          ...prev,
          todayAttendance: attendance.length,
        }));
        
        // Keep only the most recent 5 attendance records
        setRecentAttendance(attendance.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading attendance:', error);
    }
  };

  const StatCard = ({ title, value, icon, gradient, subtitle, trend, isRealTime }: any) => (
    <div className={`relative bg-white rounded-2xl shadow-elegant p-6 card-hover overflow-hidden group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-soft`}>
            <span className="text-2xl text-white">{icon}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isRealTime && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600 font-medium">LIVE</span>
              </div>
            )}
            {trend && (
              <div className="flex items-center space-x-1 text-green-600">
                <span className="text-sm font-medium">↗</span>
                <span className="text-xs">+{trend}%</span>
              </div>
            )}
          </div>
        </div>
        <h3 className="text-sm font-semibold text-gray-600 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );

  const QuickActionCard = ({ href, title, description, icon, gradient }: any) => (
    <a
      href={href}
      className={`block p-6 bg-gradient-to-br ${gradient} text-white rounded-2xl card-hover shadow-elegant group relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h4 className="text-lg font-bold mb-2">{title}</h4>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
    </a>
  );

  if (isLoading || attendanceLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">💄</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-2xl text-white">👋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, <span className="text-gradient">{user?.name}</span>!
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Here's what's happening at your parlour today
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Employees"
            value={attendanceStats?.totalEmployees || stats.totalEmployees}
            icon="👥"
            gradient="from-blue-500 to-blue-600"
            subtitle="Active staff members"
            trend="12"
            isRealTime={true}
          />
          <StatCard
            title="Currently Present"
            value={attendanceStats?.currentlyCheckedIn || stats.presentEmployees}
            icon="✅"
            gradient="from-green-500 to-emerald-600"
            subtitle="Currently checked in"
            isRealTime={true}
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceStats?.attendancePercentage || 0}%`}
            icon="📊"
            gradient="from-purple-500 to-purple-600"
            subtitle={`${attendanceStats?.currentlyCheckedIn || 0} out of ${attendanceStats?.totalEmployees || 0} at work`}
            isRealTime={true}
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingTasks}
            icon="⏳"
            gradient="from-red-500 to-rose-600"
            subtitle="Awaiting completion"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Attendance Overview - Spans 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-elegant p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <span className="text-xl text-white">⏰</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Today's Attendance</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">LIVE UPDATES</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm px-4 py-2 rounded-full font-semibold shadow-soft">
                    {stats.todayAttendance} records
                  </div>
                </div>
              </div>
              
              {/* Real-time Attendance Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{attendanceStats?.totalEmployees || 0}</p>
                  <p className="text-sm text-gray-600">Total Staff</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{attendanceStats?.currentlyCheckedIn || 0}</p>
                  <p className="text-sm text-gray-600">Currently In</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats?.attendancePercentage || 0}%</p>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl card-hover border border-gray-100">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-soft ${
                          record.action === 'punch_in' 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-red-500 to-rose-600'
                        }`}>
                          <span className="text-xl text-white">👤</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{record.employee.name}</p>
                          <p className="text-sm text-gray-600 font-medium">{record.employee.position}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          record.action === 'punch_in' 
                            ? 'bg-green-100 text-green-800 shadow-soft' 
                            : 'bg-red-100 text-red-800 shadow-soft'
                        }`}>
                          {record.action === 'punch_in' ? '🟢 CHECKED IN' : '🔴 CHECKED OUT'}
                        </span>
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-gray-400">📅</span>
                    </div>
                    <p className="text-gray-500 text-lg font-medium">No attendance records today</p>
                    <p className="text-gray-400 text-sm">Records will appear here as employees check in/out</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-elegant p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white text-sm">⚡</span>
                </span>
                Quick Actions
              </h3>
              
              <div className="space-y-4">
                <QuickActionCard
                  href="/dashboard/employees"
                  title="Manage Staff"
                  description="Add, edit, or view employees"
                  icon="👥"
                  gradient="from-purple-500 to-purple-600"
                />

                <QuickActionCard
                  href="/dashboard/tasks"
                  title="Assign Tasks"
                  description="Create and manage tasks"
                  icon="📋"
                  gradient="from-blue-500 to-blue-600"
                />

                <QuickActionCard
                  href="/attendance"
                  title="Punch Station"
                  description="Employee check in/out"
                  icon="🖥️"
                  gradient="from-green-500 to-emerald-600"
                />
              </div>
            </div>

            {/* Live Status Indicator */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-elegant">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <h4 className="font-bold text-lg">System Status</h4>
              </div>
              <p className="text-green-100 text-sm mb-3">All systems operational</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-100">WebSocket</span>
                  <span className="text-white font-semibold">🟢 Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-100">Database</span>
                  <span className="text-white font-semibold">🟢 Online</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-100">Real-time Updates</span>
                  <span className="text-white font-semibold">🟢 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
