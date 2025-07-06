'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

interface UserStats {
  totalUsers: number;
  adminCount: number;
  superAdminCount: number;
  employeeCount: number;
}

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.getUserStats();
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch user statistics');
      }
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch user statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useUserStats; 