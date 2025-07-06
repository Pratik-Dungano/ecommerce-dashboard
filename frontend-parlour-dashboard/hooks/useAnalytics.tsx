'use client';

import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../lib/api';

interface RevenueTrend {
  period: string;
  revenue: number;
  tasks: number;
  avgRevenue?: number;
}

interface SalaryRange {
  range: string;
  count: number;
  totalSalary: number;
}

interface DepartmentSalary {
  department: string;
  employeeCount: number;
  totalSalary: number;
  avgSalary: number;
}

interface TaskStatus {
  _id: string;
  count: number;
  totalValue?: number;
}

interface TaskPriority {
  _id: string;
  count: number;
  completed: number;
}

interface TaskCategory {
  _id: string;
  total: number;
  completed: number;
  revenue: number;
}

interface CompletionTrend {
  period: string;
  completed: number;
  revenue: number;
}

interface EmployeePerformance {
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  completedTasks: number;
  totalRevenue: number;
  avgRevenuePerTask: number;
}

interface AttendancePerformance {
  name: string;
  position: string;
  department: string;
  currentStatus: string;
  totalPunchIns: number;
  recentAttendance: number;
}

interface DepartmentPerformance {
  department: string;
  completedTasks: number;
  totalRevenue: number;
  employeeCount: number;
  avgTasksPerEmployee: number;
  avgRevenuePerEmployee: number;
}

interface AnalyticsData {
  revenueTrends: RevenueTrend[];
  salaryDistribution: {
    salaryRanges: SalaryRange[];
    departmentSalaries: DepartmentSalary[];
    totalSalaryPaid: number;
    totalEmployees: number;
  };
  taskAnalytics: {
    statusDistribution: TaskStatus[];
    priorityDistribution: TaskPriority[];
    categoryAnalysis: TaskCategory[];
    completionTrends: CompletionTrend[];
  };
  employeePerformance: {
    topPerformers: EmployeePerformance[];
    attendanceLeaders: AttendancePerformance[];
    departmentPerformance: DepartmentPerformance[];
    totalEmployees: number;
  };
}

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getDashboardAnalytics();
      
      if (response.success && response.data) {
        setAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to fetch analytics data');
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};

// Individual hooks for specific analytics
export const useRevenueTrends = (period: 'day' | 'week' | 'month' = 'month') => {
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getRevenueTrends(period);
      
      if (response.success && response.data) {
        setTrends(response.data.trends);
      } else {
        setError(response.message || 'Failed to fetch revenue trends');
      }
    } catch (err: any) {
      console.error('Error fetching revenue trends:', err);
      setError(err.response?.data?.message || 'Failed to fetch revenue trends');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  return {
    trends,
    isLoading,
    error,
    refetch: fetchTrends,
  };
};

export const useTaskAnalytics = () => {
  const [taskAnalytics, setTaskAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTaskAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getTaskAnalytics();
      
      if (response.success && response.data) {
        setTaskAnalytics(response.data);
      } else {
        setError(response.message || 'Failed to fetch task analytics');
      }
    } catch (err: any) {
      console.error('Error fetching task analytics:', err);
      setError(err.response?.data?.message || 'Failed to fetch task analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTaskAnalytics();
  }, [fetchTaskAnalytics]);

  return {
    taskAnalytics,
    isLoading,
    error,
    refetch: fetchTaskAnalytics,
  };
};

export const useEmployeePerformance = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getEmployeePerformance();
      
      if (response.success && response.data) {
        setPerformance(response.data);
      } else {
        setError(response.message || 'Failed to fetch employee performance');
      }
    } catch (err: any) {
      console.error('Error fetching employee performance:', err);
      setError(err.response?.data?.message || 'Failed to fetch employee performance');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  return {
    performance,
    isLoading,
    error,
    refetch: fetchPerformance,
  };
};

export const useSalaryDistribution = () => {
  const [distribution, setDistribution] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDistribution = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await analyticsAPI.getSalaryDistribution();
      
      if (response.success && response.data) {
        setDistribution(response.data);
      } else {
        setError(response.message || 'Failed to fetch salary distribution');
      }
    } catch (err: any) {
      console.error('Error fetching salary distribution:', err);
      setError(err.response?.data?.message || 'Failed to fetch salary distribution');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribution();
  }, [fetchDistribution]);

  return {
    distribution,
    isLoading,
    error,
    refetch: fetchDistribution,
  };
};

export default useAnalytics; 