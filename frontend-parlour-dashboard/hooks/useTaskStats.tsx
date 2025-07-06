'use client';

import { useState, useEffect } from 'react';
import { taskAPI } from '../lib/api';

interface TaskStats {
  incompleteTasks: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
}

export const useTaskStats = () => {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [totalTasks, setTotalTasks] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch task stats and all tasks to get total count
      const [statsResponse, allTasksResponse] = await Promise.all([
        taskAPI.getTaskStats(),
        taskAPI.getAll()
      ]);
      
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        setError(statsResponse.message || 'Failed to fetch task statistics');
      }

      if (allTasksResponse.success && allTasksResponse.data) {
        setTotalTasks(allTasksResponse.data.count);
      }
    } catch (err: any) {
      console.error('Error fetching task stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch task statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    totalTasks,
    incompleteTasks: stats?.incompleteTasks || 0,
    highPriorityTasks: stats?.highPriorityTasks || 0,
    mediumPriorityTasks: stats?.mediumPriorityTasks || 0,
    lowPriorityTasks: stats?.lowPriorityTasks || 0,
    isLoading,
    error,
    refetch: fetchStats,
  };
};

export default useTaskStats; 