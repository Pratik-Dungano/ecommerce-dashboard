'use client';

import { useState, useEffect } from 'react';
import { taskAPI } from '../lib/api';

interface RevenueData {
  totalEarned: number;
  totalSalaryGiven: number;
  netRevenue: number;
  completedTasksCount: number;
  totalSalaryRecords: number;
  employeesPaidThisMonth: number;
  currentMonthSalary: number;
  totalEmployees: number;
  currentMonth: string;
}

export const useRevenue = () => {
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRevenue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching revenue data...');
      const response = await taskAPI.getRevenue();
      console.log('Revenue API response:', response);
      
      if (response.success && response.data) {
        console.log('Revenue data received:', response.data);
        setRevenue(response.data);
      } else {
        console.error('Revenue API error:', response.message);
        setError(response.message || 'Failed to fetch revenue data');
      }
    } catch (err: any) {
      console.error('Error fetching revenue:', err);
      setError(err.response?.data?.message || 'Failed to fetch revenue data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
  }, []);

  return {
    revenue,
    isLoading,
    error,
    refetch: fetchRevenue,
  };
};

export default useRevenue; 