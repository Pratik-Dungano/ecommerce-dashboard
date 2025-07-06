'use client';

import { useState, useEffect } from 'react';
import { taskAPI, handleApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CompletedTaskStats {
  totalCompleted: number;
  thisMonth: number;
  thisWeek: number;
}

export const useEmployeeCompletedTasks = () => {
  const [stats, setStats] = useState<CompletedTaskStats>({
    totalCompleted: 0,
    thisMonth: 0,
    thisWeek: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCompletedTaskStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await taskAPI.getMyTasks();
      
      if (response.success && response.data?.tasks) {
        const tasks = response.data.tasks;
        
        // Get current date ranges
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filter completed tasks
        const completedTasks = tasks.filter((task: any) => task.status === 'completed');
        
        // Count by time periods
        const thisWeek = completedTasks.filter((task: any) => {
          const completedDate = new Date(task.completedAt || task.updatedAt);
          return completedDate >= startOfWeek;
        }).length;
        
        const thisMonth = completedTasks.filter((task: any) => {
          const completedDate = new Date(task.completedAt || task.updatedAt);
          return completedDate >= startOfMonth;
        }).length;

        setStats({
          totalCompleted: completedTasks.length,
          thisMonth,
          thisWeek,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedTaskStats();
  }, [user]);

  return { stats, isLoading, refetch: fetchCompletedTaskStats };
}; 