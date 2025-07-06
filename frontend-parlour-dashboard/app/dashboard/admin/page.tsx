'use client';

import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAttendanceStats } from "@/hooks/useAttendanceStats";
import { useTaskStats } from "@/hooks/useTaskStats";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { stats: attendanceStats, isLoading: attendanceLoading } = useAttendanceStats();
  const { totalTasks, incompleteTasks, highPriorityTasks, mediumPriorityTasks, lowPriorityTasks, stats: taskStats } = useTaskStats();

  const stats = [
    {
      title: "Total Employees",
      value: attendanceStats?.totalEmployees || "0",
      icon: "👥",
      change: `${attendanceStats?.currentlyCheckedIn || 0} checked in`,
      color: "from-blue-500 to-blue-600",
      isRealTime: true,
      hoverDetails: {
        totalEmployees: attendanceStats?.totalEmployees || 0,
        currentlyCheckedIn: attendanceStats?.currentlyCheckedIn || 0,
        presentEmployees: attendanceStats?.presentEmployees || 0
      }
    },
    {
      title: "Today's Attendance",
      value: `${attendanceStats?.attendancePercentage?.toFixed(1) || '0'}%`,
      icon: "📅",
      change: `${attendanceStats?.currentlyCheckedIn || 0} currently at work`,
      color: "from-green-500 to-green-600",
      isRealTime: true,
      hoverDetails: {
        attendancePercentage: attendanceStats?.attendancePercentage || 0,
        currentlyCheckedIn: attendanceStats?.currentlyCheckedIn || 0,
        totalEmployees: attendanceStats?.totalEmployees || 0
      }
    },
    {
      title: "Incomplete Tasks",
      value: incompleteTasks || "0",
      icon: "📋",
      change: `${totalTasks - incompleteTasks} completed`,
      color: "from-orange-500 to-red-500",
      hoverDetails: {
        highPriority: taskStats?.highPriorityTasks || 0,
        mediumPriority: taskStats?.mediumPriorityTasks || 0,
        lowPriority: taskStats?.lowPriorityTasks || 0
      }
    }
  ];

  const quickActions = [
    {
      title: "Employee Management",
      description: "Manage your branch employees, view profiles, and handle assignments",
      icon: "👥",
      link: "/dashboard/admin/employees",
      color: "from-blue-50 to-indigo-50",
      iconColor: "from-blue-500 to-indigo-500"
    },
    {
      title: "Task Assignment",
      description: "Create, assign, and track tasks for your team members",
      icon: "📋",
      link: "/dashboard/admin/tasks",
      color: "from-green-50 to-emerald-50",
      iconColor: "from-green-500 to-emerald-500"
    },
    {
      title: "Attendance Overview",
      description: "Monitor employee attendance and working hours in real-time",
      icon: "⏰",
      link: "/dashboard/admin/attendance",
      color: "from-purple-50 to-pink-50",
      iconColor: "from-purple-500 to-pink-500"
    }
  ];

  if (attendanceLoading) {
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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 mb-8"
      >
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}!</h2>
            <p className="text-gray-600">Here's what's happening at your branch today</p>
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <span className="text-2xl text-white">{stat.icon}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {stat.isRealTime && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                    </div>
                  )}
                  <div className="bg-gray-100 rounded-full px-3 py-1">
                    <p className="text-xs font-medium text-gray-600">{stat.change}</p>
                  </div>
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>

              {/* Hover Effects */}
              {stat.hoverDetails && stat.title === "Total Employees" && (
                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-blue-200 z-10">
                  <div className="space-y-2">
                    <div className="text-center mb-2">
                      <span className="text-lg font-bold text-gray-800">Employee Status</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">✅</span>
                        <span className="text-sm text-gray-600">Checked In:</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">{stat.hoverDetails.currentlyCheckedIn}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">👥</span>
                        <span className="text-sm text-gray-600">Total Staff:</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{stat.hoverDetails.totalEmployees}</span>
                    </div>
                  </div>
                </div>
              )}

              {stat.hoverDetails && stat.title === "Today's Attendance" && (
                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-green-200 z-10">
                  <div className="space-y-2">
                    <div className="text-center mb-2">
                      <span className="text-lg font-bold text-gray-800">Attendance Details</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🏢</span>
                        <span className="text-sm text-gray-600">Checked In:</span>
                      </div>
                      <span className="text-xl font-bold text-blue-600">{stat.hoverDetails.currentlyCheckedIn}</span>
                    </div>
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

              {stat.hoverDetails && stat.title === "Incomplete Tasks" && (
                <div className="absolute inset-0 bg-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 border-2 border-orange-200 z-10">
                  <div className="space-y-1">
                    <div className="text-center mb-2">
                      <span className="text-lg font-bold text-gray-800">Priority Breakdown</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🔴</span>
                        <span className="text-sm text-gray-600">High:</span>
                      </div>
                      <span className="text-2xl font-bold text-red-600">{stat.hoverDetails.highPriority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">🟡</span>
                        <span className="text-sm text-gray-600">Medium:</span>
                      </div>
                      <span className="text-lg font-bold text-yellow-600">{stat.hoverDetails.mediumPriority}</span>
                    </div>
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
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <Card 
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
          </motion.div>
        ))}
      </div>
    </div>
  );
} 