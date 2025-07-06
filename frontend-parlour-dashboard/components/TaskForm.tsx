'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreateTaskData, Task, Employee } from '@/types';
import { employeeAPI } from '@/lib/api';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
  initialData?: Task;
  isLoading?: boolean;
}

export default function TaskForm({ onSubmit, onCancel, initialData, isLoading }: TaskFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<CreateTaskData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    assignedTo: initialData?.assignedTo._id || '',
    priority: initialData?.priority || 'medium',
    dueDate: initialData?.dueDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    price: initialData?.price || undefined,
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await employeeAPI.getAll();
        if (response.data?.employees) {
          setEmployees(response.data.employees);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Handle price as number or undefined if empty
      const priceValue = value === '' ? undefined : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: priceValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="Enter task title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Enter task description"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <Label htmlFor="assignedTo">Assign To</Label>
        <select
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Select Employee</option>
          {employees.map(employee => (
            <option key={employee._id} value={employee._id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="price">Price (Optional)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          step="0.01"
          min="0"
          value={formData.price || ''}
          onChange={handleChange}
          placeholder="Enter task price"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 