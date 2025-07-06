'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useRevenueTrends, useTaskAnalytics, useEmployeePerformance, useSalaryDistribution } from "@/hooks/useAnalytics";
import RevenueChart from "@/components/charts/RevenueChart";
import SalaryChart from "@/components/charts/SalaryChart";
import TaskChart from "@/components/charts/TaskChart";
import EmployeeChart from "@/components/charts/EmployeeChart";
import { motion } from "framer-motion";

type ChartType = 
  | 'revenue-trends'
  | 'salary-ranges'
  | 'salary-departments'
  | 'task-status'
  | 'task-priority'
  | 'task-categories'
  | 'top-performers'
  | 'attendance-leaders'
  | 'department-performance';

interface ChartOption {
  value: ChartType;
  label: string;
  icon: string;
  description: string;
  category: string;
}

export default function ReportsPage() {
  const [selectedChart, setSelectedChart] = useState<ChartType>('revenue-trends');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Analytics data
  const { trends: revenueTrends, isLoading: trendsLoading } = useRevenueTrends('month');
  const { taskAnalytics, isLoading: taskAnalyticsLoading } = useTaskAnalytics();
  const { performance: employeePerformance, isLoading: performanceLoading } = useEmployeePerformance();
  const { distribution: salaryDistribution, isLoading: salaryLoading } = useSalaryDistribution();

  const chartOptions: ChartOption[] = [
    // Revenue Analytics
    {
      value: 'revenue-trends',
      label: 'Revenue Trends',
      icon: '📈',
      description: 'Monthly revenue and task completion trends',
      category: 'Revenue Analytics'
    },
    
    // Salary Analytics
    {
      value: 'salary-ranges',
      label: 'Salary Distribution by Ranges',
      icon: '💰',
      description: 'Employee count across different salary ranges',
      category: 'Salary Analytics'
    },
    {
      value: 'salary-departments',
      label: 'Department Salary Analysis',
      icon: '💼',
      description: 'Average salaries and employee counts by department',
      category: 'Salary Analytics'
    },
    
    // Task Analytics
    {
      value: 'task-status',
      label: 'Task Status Distribution',
      icon: '📊',
      description: 'Breakdown of tasks by status (assigned, in-progress, completed)',
      category: 'Task Analytics'
    },
    {
      value: 'task-priority',
      label: 'Task Priority Analysis',
      icon: '🎯',
      description: 'Task completion rates by priority level',
      category: 'Task Analytics'
    },
    {
      value: 'task-categories',
      label: 'Service Categories Performance',
      icon: '🏷️',
      description: 'Revenue and task count by service categories',
      category: 'Task Analytics'
    },
    
    // Employee Performance
    {
      value: 'top-performers',
      label: 'Top Performing Employees',
      icon: '🏆',
      description: 'Employees ranked by tasks completed and revenue generated',
      category: 'Employee Performance'
    },
    {
      value: 'attendance-leaders',
      label: 'Attendance Leaders',
      icon: '📅',
      description: 'Most regular employees based on attendance patterns',
      category: 'Employee Performance'
    },
    {
      value: 'department-performance',
      label: 'Department Performance',
      icon: '🏢',
      description: 'Performance comparison across departments',
      category: 'Employee Performance'
    }
  ];

  const selectedOption = chartOptions.find(option => option.value === selectedChart);

  const renderChart = () => {
    const chartHeight = 500;

    switch (selectedChart) {
      case 'revenue-trends':
        return trendsLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <RevenueChart data={revenueTrends || []} height={chartHeight} />
        );

      case 'salary-ranges':
        return salaryLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <SalaryChart 
            salaryRanges={salaryDistribution?.salaryRanges || []} 
            departmentSalaries={salaryDistribution?.departmentSalaries || []}
            type="ranges"
            height={chartHeight} 
          />
        );

      case 'salary-departments':
        return salaryLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <SalaryChart 
            salaryRanges={salaryDistribution?.salaryRanges || []} 
            departmentSalaries={salaryDistribution?.departmentSalaries || []}
            type="departments"
            height={chartHeight} 
          />
        );

      case 'task-status':
        return taskAnalyticsLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <TaskChart 
            statusData={taskAnalytics?.statusDistribution || []} 
            type="status"
            height={chartHeight} 
          />
        );

      case 'task-priority':
        return taskAnalyticsLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <TaskChart 
            priorityData={taskAnalytics?.priorityDistribution || []} 
            type="priority"
            height={chartHeight} 
          />
        );

      case 'task-categories':
        return taskAnalyticsLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        ) : (
          <TaskChart 
            categoryData={taskAnalytics?.categoryAnalysis || []} 
            type="category"
            height={chartHeight} 
          />
        );

      case 'top-performers':
        return performanceLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
          </div>
        ) : (
          <EmployeeChart 
            topPerformers={employeePerformance?.topPerformers || []} 
            type="performers"
            height={chartHeight} 
          />
        );

      case 'attendance-leaders':
        return performanceLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <EmployeeChart 
            attendanceLeaders={employeePerformance?.attendanceLeaders || []} 
            type="attendance"
            height={chartHeight} 
          />
        );

      case 'department-performance':
        return performanceLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <EmployeeChart 
            departmentPerformance={employeePerformance?.departmentPerformance || []} 
            type="departments"
            height={chartHeight} 
          />
        );

      default:
        return <div>Chart not found</div>;
    }
  };

  // Group options by category
  const groupedOptions = chartOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, ChartOption[]>);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
            </div>
          </div>
          
          {/* Chart Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span className="text-xl">{selectedOption?.icon}</span>
              <span>{selectedOption?.label}</span>
              <svg 
                className={`w-5 h-5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
              >
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <div key={category} className="p-2">
                    <div className="px-3 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      {category}
                    </div>
                    {options.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedChart(option.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 hover:bg-purple-50 ${
                          selectedChart === option.value ? 'bg-purple-100 border-l-4 border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">{option.icon}</span>
                          <div>
                            <div className="font-medium text-gray-800">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Display */}
      <motion.div
        key={selectedChart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 border-none shadow-lg">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-3xl">{selectedOption?.icon}</span>
              <h2 className="text-2xl font-bold text-gray-800">{selectedOption?.label}</h2>
            </div>
            <p className="text-gray-600">{selectedOption?.description}</p>
            <div className="mt-2 inline-block">
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {selectedOption?.category}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6">
            {renderChart()}
          </div>
        </Card>
      </motion.div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-gray-800">
                ₹{revenueTrends?.reduce((sum, trend) => sum + trend.revenue, 0)?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">📋</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-xl font-bold text-gray-800">
                {taskAnalytics?.statusDistribution?.reduce((sum, status) => sum + status.count, 0) || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-xl font-bold text-gray-800">
                {salaryDistribution?.totalEmployees || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">🏆</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Top Performers</p>
              <p className="text-xl font-bold text-gray-800">
                {employeePerformance?.topPerformers?.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
} 