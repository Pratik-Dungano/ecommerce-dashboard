'use client';

import { useEffect, useState, useCallback } from 'react';
import { TaskCard } from "@/components/TaskCard";
import { taskAPI, handleApiError } from "@/lib/api";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const REFRESH_INTERVAL = 60 * 1000; // Refresh every minute

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await taskAPI.getAll();
      if (response.data?.tasks) {
        setTasks(response.data.tasks);
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
  }, [toast]);

  useEffect(() => {
    fetchTasks();
    // Set up periodic refresh
    const intervalId = setInterval(fetchTasks, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchTasks]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
          <p className="text-gray-600">View and monitor branch tasks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            isReadOnly={true}
          />
        ))}
      </div>
    </div>
  );
} 