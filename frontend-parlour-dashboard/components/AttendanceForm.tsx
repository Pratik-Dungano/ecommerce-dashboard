'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { PunchData, Employee } from '@/types';
import { employeeAPI } from '@/lib/api';

interface AttendanceFormProps {
  onSubmit: (data: PunchData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AttendanceForm({ onSubmit, onCancel, isLoading }: AttendanceFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<PunchData>({
    employeeId: '',
    action: 'punch_in',
    notes: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee</Label>
        <select
          id="employeeId"
          name="employeeId"
          value={formData.employeeId}
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
        <Label htmlFor="action">Action</Label>
        <select
          id="action"
          name="action"
          value={formData.action}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="punch_in">Punch In</option>
          <option value="punch_out">Punch Out</option>
        </select>
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Add any notes about this attendance record"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
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
          {isLoading ? 'Saving...' : 'Record Attendance'}
        </Button>
      </div>
    </form>
  );
} 