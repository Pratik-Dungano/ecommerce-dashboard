'use client';

import { useEffect, useState, useCallback } from 'react';
import { Modal } from "@/components/ui/modal";
import TaskForm from "@/components/TaskForm";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { taskAPI, handleApiError } from "@/lib/api";
import { Task, CreateTaskData } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const REFRESH_INTERVAL = 60 * 1000; // Refresh every minute

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      setIsLoading(true);
      // Convert Employee object to ID string if it exists in updates
      const apiUpdates = {
        ...updates,
        assignedTo: updates.assignedTo ? updates.assignedTo._id : undefined
      };
      await taskAPI.update(taskId, apiUpdates);
      await fetchTasks();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
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

  const handleSubmit = async (data: CreateTaskData) => {
    try {
      setIsLoading(true);
      if (selectedTask) {
        await taskAPI.update(selectedTask._id, data);
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        await taskAPI.create(data);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      setIsModalOpen(false);
      await fetchTasks();
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

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Task Management</h1>
          <p className="text-gray-600">Manage and track all tasks</p>
        </div>
        <Button onClick={handleAddTask} disabled={isLoading}>
          + Add New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onUpdate={handleUpdateTask}
            onEdit={handleEditTask}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? "Edit Task" : "Add New Task"}
      >
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          initialData={selectedTask || undefined}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
} 