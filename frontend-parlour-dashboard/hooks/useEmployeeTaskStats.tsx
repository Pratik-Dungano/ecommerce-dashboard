'use client';

import { useState, useEffect } from 'react';
import { taskAPI, handleApiError } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface TaskStats {
  totalToday: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
}

export const useEmployeeTaskStats = () => {
  const [stats, setStats] = useState<TaskStats>({
    totalToday: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTaskStats = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await taskAPI.getMyTasks();
      
      if (response.success && response.data?.tasks) {
        const tasks = response.data.tasks;
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter tasks assigned today
        const todayTasks = tasks.filter((task: any) => {
          const taskDate = new Date(task.createdAt);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate.getTime() === today.getTime();
        });

        // Count by priority
        const highPriority = todayTasks.filter((task: any) => task.priority === 'high').length;
        const mediumPriority = todayTasks.filter((task: any) => task.priority === 'medium').length;
        const lowPriority = todayTasks.filter((task: any) => task.priority === 'low').length;

        setStats({
          totalToday: todayTasks.length,
          highPriority,
          mediumPriority,
          lowPriority,
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
    fetchTaskStats();
  }, [user]);

  return { stats, isLoading, refetch: fetchTaskStats };
}; 