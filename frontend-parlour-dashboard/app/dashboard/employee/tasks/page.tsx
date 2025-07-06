"use client";

import { useEffect, useState, useCallback } from 'react';
import { TaskCard } from "@/components/TaskCard";
import { taskAPI, handleApiError } from "@/lib/api";
import { Task } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";

const REFRESH_INTERVAL = 60 * 1000; // Refresh every minute

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await taskAPI.getMyTasks();
      if (response.data?.tasks) {
        console.log('My tasks from API:', response.data.tasks);
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
    if (user) {
      fetchTasks();
      // Set up periodic refresh
      const intervalId = setInterval(fetchTasks, REFRESH_INTERVAL);
      return () => clearInterval(intervalId);
    }
  }, [fetchTasks, user]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-gray-600">View tasks assigned to you</p>
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

      {isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      )}

      {!isLoading && tasks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No tasks assigned to you.</p>
        </div>
      )}
    </div>
  );
} 