'use client';

import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useEmployeeTaskStats } from "@/hooks/useEmployeeTaskStats";
import { useEmployeeAttendanceStats } from "@/hooks/useEmployeeAttendanceStats";
import { useEmployeeCompletedTasks } from "@/hooks/useEmployeeCompletedTasks";
import Link from "next/link";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const { stats: taskStats, isLoading: taskLoading } = useEmployeeTaskStats();
  const { stats: attendanceStats, isLoading: attendanceLoading } = useEmployeeAttendanceStats();
  const { stats: completedStats, isLoading: completedLoading } = useEmployeeCompletedTasks();

  const stats = [
    {
      title: "Tasks Assigned Today",
      value: taskLoading ? "..." : taskStats.totalToday.toString(),
      icon: "📋",
      change: `${taskStats.highPriority} high priority`,
      color: "from-purple-500 to-purple-600",
      hoverContent: (
        <div className="space-y-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{taskStats.highPriority}</div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="flex justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">{taskStats.mediumPriority}</div>
              <div className="text-gray-600">🟡 Medium</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{taskStats.lowPriority}</div>
              <div className="text-gray-600">🟢 Low</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Attendance Rate",
      value: attendanceLoading ? "..." : `${attendanceStats.attendancePercentage}%`,
      icon: "⏰",
      change: `${attendanceStats.presentDays}/${attendanceStats.totalDays} days`,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Completed Tasks",
      value: completedLoading ? "..." : completedStats.totalCompleted.toString(),
      icon: "✅",
      change: `${completedStats.thisMonth} this month`,
      color: "from-blue-500 to-blue-600"
    }
  ];

  const quickActions = [
    {
      title: "View Tasks",
      description: "Check your assigned tasks",
      icon: "📋",
      link: "/dashboard/employee/tasks"
    },
    {
      title: "Attendance Logs",
      description: "View your attendance history",
      icon: "⏰",
      link: "/dashboard/employee/attendance-logs"
    },
    {
      title: "My Profile",
      description: "View and update your profile",
      icon: "👤",
      link: "/dashboard/employee/profile"
    }
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl p-6 shadow-md mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <span className="text-3xl">👨‍💼</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome, {user?.name}!</h2>
            <p className="text-gray-600">Here's your daily overview</p>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`p-6 border-none shadow-md relative group ${index === 0 ? 'cursor-pointer' : ''}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="bg-gray-100 rounded-full px-3 py-1">
                <p className="text-xs font-medium text-gray-600">{stat.change}</p>
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
            
            {/* Hover tooltip for first card */}
            {index === 0 && stat.hoverContent && (
              <div className="absolute inset-0 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4 z-10">
                {stat.hoverContent}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.link}>
            <Card className="p-6 border-none shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mb-4">
              <span className="text-2xl">{action.icon}</span>
            </div>
            <h3 className="text-gray-800 font-semibold">
              {action.title}
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              {action.description}
            </p>
          </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 