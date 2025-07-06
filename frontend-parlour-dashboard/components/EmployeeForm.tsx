'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertTriangle } from 'lucide-react';
import { CreateEmployeeData, Employee } from '@/types';

interface EmployeeFormProps {
  onSubmit: (data: CreateEmployeeData) => Promise<void>;
  onCancel: () => void;
  initialData?: Employee;
  isLoading?: boolean;
  isSuperAdmin?: boolean;
}

const formatSalary = (salary: number | undefined) => {
  if (salary === undefined || salary === null || salary === 0) return '';
  return salary.toString();
};

export default function EmployeeForm({ onSubmit, onCancel, initialData, isLoading, isSuperAdmin }: EmployeeFormProps) {
  const [formData, setFormData] = useState<CreateEmployeeData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    position: initialData?.position || '',
    department: initialData?.department || '',
    joinDate: initialData?.joinDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    isLeaving: initialData?.isLeaving || false,
    leavingDate: initialData?.leavingDate?.split('T')[0] || '',
    salary: initialData?.salary || 0,
  });

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        position: initialData.position || '',
        department: initialData.department || '',
        joinDate: initialData.joinDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        isLeaving: initialData.isLeaving || false,
        leavingDate: initialData.leavingDate?.split('T')[0] || '',
        salary: initialData.salary || 0,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              name === 'salary' ? (value ? parseInt(value, 10) : 0) : 
              value 
    }));
  };

  const handleLeavingToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      isLeaving: true,
      leavingDate: today
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter employee name"
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="Enter employee email"
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          required
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <Label htmlFor="position">Position</Label>
        <Input
          id="position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          required
          placeholder="Enter position"
        />
      </div>

      <div>
        <Label htmlFor="department">Department</Label>
        <Input
          id="department"
          name="department"
          value={formData.department}
          onChange={handleChange}
          required
          placeholder="Enter department"
        />
      </div>

      {isSuperAdmin && (
        <div>
          <Label htmlFor="salary" className="flex items-center gap-2">
            Monthly Salary
            {(!formData.salary || formData.salary === 0) && (
              <span className="text-sm text-gray-500">(Not set)</span>
            )}
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
            <Input
              id="salary"
              name="salary"
              type="number"
              value={formatSalary(formData.salary)}
              onChange={handleChange}
              placeholder="Enter monthly salary"
              className="pl-7"
              min="0"
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="joinDate">Join Date</Label>
        <Input
          id="joinDate"
          name="joinDate"
          type="date"
          value={formData.joinDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isLeaving"
          name="isLeaving"
          checked={formData.isLeaving}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="isLeaving" className="text-red-600 font-medium">
          Employee is leaving
        </Label>
      </div>

      {formData.isLeaving && (
        <div>
          <Label htmlFor="leavingDate">Leaving Date</Label>
          <Input
            id="leavingDate"
            name="leavingDate"
            type="date"
            value={formData.leavingDate}
            onChange={handleChange}
            required={formData.isLeaving}
          />
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={handleLeavingToday}
          disabled={formData.isLeaving || isLoading}
          className="flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4" />
          Leaving Today
        </Button>

        <div className="flex space-x-2">
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
      </div>
    </form>
  );
} 