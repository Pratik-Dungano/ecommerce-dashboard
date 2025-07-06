'use client';

import { Card } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import { useTaskStats } from "@/hooks/useTaskStats";
import { useAttendanceStats } from "@/hooks/useAttendanceStats";
import { useRevenue } from "@/hooks/useRevenue";
import { useRouter } from "next/navigation";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { users } = useUsers();
  const { totalTasks, incompleteTasks, highPriorityTasks, mediumPriorityTasks, lowPriorityTasks, stats: taskStats } = useTaskStats();
  const { stats: attendanceStats } = useAttendanceStats();
  const { revenue } = useRevenue();

  const totalUsers = users?.length || 0;
  const totalEmployees = users?.filter(user => user.role === 'employee').length || 0;
  const totalAdmins = users?.filter(user => user.role === 'admin').length || 0;
  const totalSuperAdmins = users?.filter(user => user.role === 'super_admin').length || 0;
  const todayAttendance = attendanceStats?.presentEmployees || 0;

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: "👥",
      change: `${totalEmployees} employees`,
      color: "from-blue-500 to-blue-600",
      hoverDetails: {
        admins: totalAdmins,
        superAdmins: totalSuperAdmins
      }
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: "👨‍💼",
      change: "Active staff",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Incomplete Tasks",
      value: incompleteTasks,
      icon: "📋",
      change: `${totalTasks - incompleteTasks} completed`,
      color: "from-orange-500 to-red-500",
      hoverDetails: {
        highPriority: taskStats?.highPriorityTasks || 0,
        mediumPriority: taskStats?.mediumPriorityTasks || 0,
        lowPriority: taskStats?.lowPriorityTasks || 0
      }
    },
    {
      title: "Today's Attendance",
      value: `${attendanceStats?.attendancePercentage?.toFixed(1) || '0'}%`,
      icon: "📅",
      change: `${attendanceStats?.currentlyCheckedIn || 0} checked in`,
      color: "from-purple-500 to-purple-600",
      hoverDetails: {
        currentlyCheckedIn: attendanceStats?.currentlyCheckedIn || 0,
        totalEmployees: attendanceStats?.totalEmployees || 0
      }
    },
    {
      title: "Total Revenue",
      value: `₹${revenue?.netRevenue?.toLocaleString() || '0.00'}`,
      icon: "💰",
      change: `${revenue?.completedTasksCount || 0} completed tasks`,
      color: "from-green-500 to-emerald-600",
      hoverDetails: {
        totalEarned: revenue?.totalEarned || 0,
        totalSalaryGiven: revenue?.totalSalaryGiven || 0,
        netRevenue: revenue?.netRevenue || 0,
        completedTasksCount: revenue?.completedTasksCount || 0
      }
    }
  ];

  const quickActions = [
    {
      title: "User Management",
      description: "Manage users, roles, and permissions across the system",
      icon: "👥",
      link: "/dashboard/super-admin/users",
      color: "from-blue-50 to-indigo-50",
      iconColor: "from-blue-500 to-indigo-500"
    },
    {
      title: "Task Management",
      description: "Oversee all tasks, assignments, and project progress",
      icon: "📋",
      link: "/dashboard/super-admin/tasks",
      color: "from-green-50 to-emerald-50",
      iconColor: "from-green-500 to-emerald-500"
    },
    {
      title: "Attendance Overview",
      description: "Monitor employee attendance and working hours",
      icon: "📅",
      link: "/dashboard/super-admin/attendance",
      color: "from-orange-50 to-red-50",
      iconColor: "from-orange-500 to-red-500"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl">👑</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
            <p className="text-gray-600 text-lg">Complete system overview and management</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <span className="text-xl text-white">{stat.icon}</span>
              </div>
              <div className="bg-gray-100 rounded-full px-3 py-1">
                <p className="text-xs font-medium text-gray-600">{stat.change}</p>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className={`text-2xl font-bold mt-1 ${stat.title === 'Total Revenue' && revenue?.netRevenue && revenue.netRevenue >= 0 ? 'text-green-600' : stat.title === 'Total Revenue' ? 'text-red-600' : 'text-gray-800'}`}>
              {stat.value}
            </p>
            
            {/* Revenue Hover Details */}
            {stat.hoverDetails && stat.title === 'Total Revenue' && (
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-green-200 z-10">
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earned:</span>
                    <span className="text-lg font-bold text-green-600">₹{stat.hoverDetails.totalEarned?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Salary Given:</span>
                    <span className="text-lg font-bold text-red-600">₹{stat.hoverDetails.totalSalaryGiven?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between items-center border-t pt-1">
                    <span className="text-sm text-gray-600">Net Revenue:</span>
                    <span className={`text-lg font-bold ${(stat.hoverDetails.netRevenue || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{stat.hoverDetails.netRevenue?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="text-center mt-1">
                    <span className="text-sm text-gray-500">
                      {stat.hoverDetails.completedTasksCount || 0} tasks
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Users Hover Details */}
            {stat.hoverDetails && stat.title === 'Total Users' && (
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-blue-200 z-10">
                <div className="space-y-2">
                  <div className="text-center mb-2">
                    <span className="text-lg font-bold text-gray-800">User Breakdown</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👨‍💼</span>
                      <span className="text-sm text-gray-600">Admins:</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stat.hoverDetails.admins}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👑</span>
                      <span className="text-sm text-gray-600">Super Admins:</span>
                    </div>
                    <span className="text-xl font-bold text-purple-600">{stat.hoverDetails.superAdmins}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Incomplete Tasks Hover Details */}
            {stat.hoverDetails && stat.title === 'Incomplete Tasks' && (
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-orange-200 z-10">
                <div className="space-y-1">
                  <div className="text-center mb-2">
                    <span className="text-lg font-bold text-gray-800">Priority Breakdown</span>
                  </div>
                  {/* High Priority - Bigger Font */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🔴</span>
                      <span className="text-sm text-gray-600">High:</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{stat.hoverDetails.highPriority}</span>
                  </div>
                  {/* Medium Priority - Medium Font */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🟡</span>
                      <span className="text-sm text-gray-600">Medium:</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-600">{stat.hoverDetails.mediumPriority}</span>
                  </div>
                  {/* Low Priority - Medium Font */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🟢</span>
                      <span className="text-sm text-gray-600">Low:</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stat.hoverDetails.lowPriority}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Today's Attendance Hover Details */}
            {stat.hoverDetails && stat.title === "Today's Attendance" && (
              <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-purple-200 z-10">
                <div className="space-y-1">
                  <div className="text-center mb-2">
                    <span className="text-lg font-bold text-gray-800">Employee Count</span>
                  </div>
                  {/* Currently Checked In */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏢</span>
                      <span className="text-sm text-gray-600">Checked In:</span>
                    </div>
                    <span className="text-xl font-bold text-blue-600">{stat.hoverDetails.currentlyCheckedIn}</span>
                  </div>
                  {/* Total Employees */}
                  <div className="flex items-center justify-between border-t pt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">👥</span>
                      <span className="text-sm text-gray-600">Total Staff:</span>
                    </div>
                    <span className="text-xl font-bold text-gray-700">{stat.hoverDetails.totalEmployees}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card 
            key={index} 
            className={`p-8 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer bg-gradient-to-br ${action.color} border-purple-200`}
            onClick={() => router.push(action.link)}
          >
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${action.iconColor} rounded-2xl flex items-center justify-center mx-auto`}>
                <span className="text-2xl text-white">{action.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{action.title}</h3>
                <p className="text-gray-600 mt-2">{action.description}</p>
              </div>
              <div className="flex items-center justify-center space-x-2 text-purple-600">
                <span className="text-sm font-medium">Access {action.title}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 