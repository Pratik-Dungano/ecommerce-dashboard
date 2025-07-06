'use client';

import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Edit2, XCircle, Check, Pencil } from 'lucide-react';
import type { Task } from '@/types';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onEdit?: (task: Task) => void;
  isReadOnly?: boolean;
}

const priorityEmojis = {
  low: '🟢',
  medium: '🟡',
  high: '🔴'
} as const;

type TaskStatus = 'assigned' | 'in_progress' | 'completed' | 'cancelled';

const statusSequence: Record<TaskStatus, { next: TaskStatus; label: string; color: string }> = {
  'assigned': { next: 'in_progress', label: 'Start Progress', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  'in_progress': { next: 'completed', label: 'Mark Complete', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  'completed': { next: 'completed', label: 'Completed', color: 'bg-green-600 text-white hover:bg-green-700' },
  'cancelled': { next: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800' }
} as const;

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'assigned': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'completed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    time: date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    }),
    date: date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  };
};

export function TaskCard({ task, onUpdate, onEdit, isReadOnly }: TaskCardProps) {
  const isCancelled = task.status === 'cancelled';
  const isCompleted = task.status === 'completed';
  const isOrphaned = !task.assignedTo;

  const handleStatusChange = () => {
    const currentStatus = task.status as keyof typeof statusSequence;
    if (statusSequence[currentStatus] && onUpdate) {
      const nextStatus = statusSequence[currentStatus].next;
      onUpdate(task._id, { 
        status: nextStatus,
        ...(nextStatus === 'completed' ? { completedAt: new Date().toISOString() } : {})
      });
    }
  };

  if (isOrphaned) {
    return (
      <Card className="p-6 bg-red-50 border-red-200 opacity-75">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{task.title}</h3>
              <p className="text-sm text-red-600">Employee no longer available</p>
            </div>
          </div>
          <span className={cn(
            "text-sm font-medium px-2 py-0.5 rounded",
            getPriorityColor(task.priority)
          )}>
            {priorityEmojis[task.priority]} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">{task.description}</p>

          <div className="space-y-1">
            <div className="flex flex-col text-sm text-gray-500 space-y-1">
              <div className="flex items-center">
                <span className="mr-2">🕒 Created:</span>
                <span>{formatDateTime(task.createdAt).time}</span>
              </div>
              <div className="flex items-center ml-6">
                <span className="text-gray-400">{formatDateTime(task.createdAt).date}</span>
              </div>
            </div>
          </div>

          {!isReadOnly && !isCompleted && !isCancelled && onEdit && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onEdit(task)}
              className="w-full mt-4"
            >
              Reassign Task
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-6 hover:shadow-lg transition-all duration-200 relative",
      isCancelled && "opacity-60 cursor-not-allowed bg-gray-50",
      isCompleted && "bg-green-50"
    )}>
      {/* Price display - Middle right edge */}
      {task.price && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
          <div className="text-base font-bold text-green-600">
            ₹{task.price.toFixed(2)}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-100 p-2 rounded-lg">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{task.title}</h3>
            <div className="flex flex-col mt-1">
              <span className="text-sm text-gray-500">Assigned to</span>
              <span className="text-sm font-medium text-gray-700">{task.assignedTo?.name}</span>
            </div>
          </div>
        </div>

        {!isCancelled && !isCompleted && !isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 flex items-center gap-1 hover:bg-gray-100">
                {priorityEmojis[task.priority]}
                <span className={cn(
                  "text-sm font-medium px-2 py-0.5 rounded",
                  getPriorityColor(task.priority)
                )}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onUpdate?.(task._id, { priority: 'low' })}>
                🟢 Low Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate?.(task._id, { priority: 'medium' })}>
                🟡 Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUpdate?.(task._id, { priority: 'high' })}>
                🔴 High Priority
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {(isCancelled || isCompleted) && (
          <span className={cn(
            "text-sm font-medium px-2 py-0.5 rounded",
            getPriorityColor(task.priority)
          )}>
            {priorityEmojis[task.priority]} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm font-medium px-2 py-0.5 rounded",
            getStatusColor(task.status)
          )}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
          </span>
        </div>

        <p className="text-gray-600">{task.description}</p>

        <div className="space-y-1">
          <div className="flex flex-col text-sm text-gray-500 space-y-1">
            <div className="flex items-center">
              <span className="mr-2">🕒 Created:</span>
              <span>{formatDateTime(task.createdAt).time}</span>
            </div>
            <div className="flex items-center ml-6">
              <span className="text-gray-400">{formatDateTime(task.createdAt).date}</span>
            </div>
          </div>
          {isCompleted && task.completedAt && (
            <div className="flex flex-col text-sm text-green-600 space-y-1 mt-2">
              <div className="flex items-center">
                <span className="mr-2">✅ Completed:</span>
                <span>{formatDateTime(task.completedAt).time}</span>
              </div>
              <div className="flex items-center ml-6">
                <span className="text-green-500">{formatDateTime(task.completedAt).date}</span>
              </div>
            </div>
          )}
        </div>

        {!isReadOnly && !isCancelled && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {!isCompleted && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleStatusChange}
                      className={statusSequence[task.status as keyof typeof statusSequence]?.color}
                    >
                      {statusSequence[task.status as keyof typeof statusSequence]?.label}
                    </Button>
                    {!isCancelled && !isCompleted && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onUpdate?.(task._id, { status: 'cancelled' })}
                        className="bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Cancel
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit button in bottom right corner */}
        {onEdit && !isCancelled && !isCompleted && !isReadOnly && (
          <div className="absolute bottom-2 right-2 p-1 rounded-lg bg-gray-50 border-[2.5px] border-gray-900">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(task)}
              className="h-8 w-8 rounded-md hover:bg-gray-100"
            >
              <Pencil className="h-5 w-5 text-gray-900 stroke-[2]" />
              <span className="sr-only">Edit Task</span>
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
