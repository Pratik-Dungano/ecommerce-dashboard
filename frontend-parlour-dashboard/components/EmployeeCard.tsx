'use client';

import React, { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Edit2, DollarSign, PencilLine, Trash2 } from 'lucide-react';
import type { Employee } from '@/types';
import { cn } from '@/lib/utils';
import { Modal } from './ui/modal';
import { format } from 'date-fns';
import { getSalaryHistory, paySalary, updateEmployeeSalary } from '@/lib/api';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input'; 

interface SalaryRecord {
  amount: number;
  date: Date;
  month: string;
  status: 'pending' | 'paid';
}

interface SalaryHistory {
  employee: {
    name: string;
    position: string;
    salary: number;
  };
  pendingSalary: SalaryRecord | null;
  salaryHistory: SalaryRecord[];
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  isReadOnly?: boolean;
  onDelete?: (employeeId: string) => void;
  onEmployeeUpdate?: () => void;
  isSuperAdmin?: boolean;
}

const formatSalary = (salary: number | undefined) => {
  if (salary === undefined || salary === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(salary);
};

export function EmployeeCard({ employee, onEdit, isReadOnly, onDelete, onEmployeeUpdate, isSuperAdmin }: EmployeeCardProps) {
  const [hasLeft, setHasLeft] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const [currentMonthPaid, setCurrentMonthPaid] = useState(false);
  const [lastCheckedMonth, setLastCheckedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [isFirstDayOfMonth, setIsFirstDayOfMonth] = useState(false);
  const { toast } = useToast();

  // Check if it's first day of month
  useEffect(() => {
    const checkFirstDay = () => {
      const now = new Date();
      setIsFirstDayOfMonth(now.getDate() === 1);
    };

    checkFirstDay();
    const interval = setInterval(checkFirstDay, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  // Check if salary is paid for current month
  const checkCurrentMonthSalaryStatus = (history: SalaryHistory) => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const isPaid = history.salaryHistory.some(record => 
      record.month === currentMonth && record.status === 'paid'
    );
    setCurrentMonthPaid(isPaid);
    setLastCheckedMonth(currentMonth);
  };

  // Check for new month and reset payment status
  useEffect(() => {
    const checkNewMonth = () => {
      const currentMonth = format(new Date(), 'yyyy-MM');
      if (currentMonth !== lastCheckedMonth) {
        setCurrentMonthPaid(false);
        if (isSalaryModalOpen) {
          fetchSalaryHistory();
        }
        setLastCheckedMonth(currentMonth);
      }
    };

    const interval = setInterval(checkNewMonth, 1000 * 60 * 60);
    checkNewMonth();
    return () => clearInterval(interval);
  }, [lastCheckedMonth, isSalaryModalOpen]);

  useEffect(() => {
    const checkLeavingStatus = () => {
      if (employee.isLeaving && employee.leavingDate) {
        const leavingDate = new Date(employee.leavingDate);
        const now = new Date();
        
        leavingDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);
        
        if (leavingDate <= now) {
          setHasLeft(true);
          if (onDelete) {
            setTimeout(() => {
              onDelete(employee._id);
            }, 60000);
          }
        }
      }
    };

    checkLeavingStatus();
    const interval = setInterval(checkLeavingStatus, 60000);
    return () => clearInterval(interval);
  }, [employee, onDelete]);

  const fetchSalaryHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getSalaryHistory(employee._id);
      
      if (!response || !response.data) {
        throw new Error('No response received from server');
      }

      const salaryData = response.data as SalaryHistory;
      setSalaryHistory(salaryData);
      checkCurrentMonthSalaryStatus(salaryData);
    } catch (error: any) {
      console.error('Error fetching salary history:', error);
      
      let errorMessage = 'Failed to fetch salary history';
      if (error.response?.status === 401) {
        errorMessage = 'Please login again to view salary information';
      } else if (error.response?.status === 404) {
        errorMessage = 'Employee salary information not found';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySalary = async () => {
    try {
      setIsLoading(true);
      await paySalary(employee._id);
      await fetchSalaryHistory();
      toast({
        title: 'Success',
        description: 'Salary paid successfully',
      });
    } catch (error) {
      console.error('Error paying salary:', error);
      toast({
        title: 'Error',
        description: 'Failed to pay salary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryEdit = async () => {
    if (!newSalary || isNaN(Number(newSalary))) {
      toast({
        title: 'Invalid Salary',
        description: 'Please enter a valid salary amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await updateEmployeeSalary(employee._id, Number(newSalary));
      await fetchSalaryHistory();
      setIsEditingSalary(false);
      
      // Refresh employee data in parent component
      if (onEmployeeUpdate) {
        onEmployeeUpdate();
      }
      
      toast({
        title: 'Success',
        description: 'Salary updated successfully',
      });
    } catch (error) {
      console.error('Error updating salary:', error);
      toast({
        title: 'Error',
        description: 'Failed to update salary',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSalaryClick = () => {
    setIsSalaryModalOpen(true);
    fetchSalaryHistory();
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(employee);
    }
  };

  return (
    <Card className={cn(
      "p-6 hover:shadow-lg transition-all duration-200 relative",
      employee.isLeaving && !hasLeft && "border-orange-200 bg-orange-50",
      hasLeft && "border-red-200 bg-red-50 opacity-75"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={cn(
            "bg-purple-100 p-2 rounded-lg",
            employee.isLeaving && !hasLeft && "bg-orange-100",
            hasLeft && "bg-red-100"
          )}>
            <span className="text-2xl">
              {hasLeft ? '🚶' : employee.isLeaving ? '🚪' : '👤'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{employee.name}</h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            hasLeft ? "bg-red-100 text-red-800" :
            employee.currentStatus === 'checked_in' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          )}>
            {hasLeft ? 'Already Left' :
             employee.currentStatus === 'checked_in' ? 'Present' : 'Absent'}
          </span>
          {employee.isLeaving && !hasLeft && (
            <span className="text-xs text-orange-600 font-medium">
              Leaving Soon
            </span>
          )}
        </div>
      </div>

      {/* Content area with bottom padding to prevent button overlap */}
      <div className="space-y-3 mt-4 pb-12">
        <div className="flex items-center text-sm">
          <span className="text-gray-600 mr-2">📧 Email:</span>
          <span className="font-medium text-gray-800">{employee.email}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-600 mr-2">📱 Phone:</span>
          <span className="font-medium text-gray-800">{employee.phone}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="text-gray-600 mr-2">🏢 Department:</span>
          <span className="font-medium text-gray-800">{employee.department}</span>
        </div>
        {employee.joinDate && (
          <div className="flex items-center text-sm">
            <span className="text-gray-600 mr-2">📅 Joined:</span>
            <span className="font-medium text-gray-800">
              {new Date(employee.joinDate).toLocaleDateString()}
            </span>
          </div>
        )}
        {employee.isLeaving && employee.leavingDate && (
          <div className="flex items-center text-sm">
            <span className={cn(
              "mr-2",
              hasLeft ? "text-red-600" : "text-orange-600"
            )}>
              {hasLeft ? '🚶 Left on:' : '🚪 Leaving on:'}
            </span>
            <span className={cn(
              "font-medium",
              hasLeft ? "text-red-800" : "text-orange-800"
            )}>
              {new Date(employee.leavingDate).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* Buttons positioned at bottom-right with proper spacing */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {!hasLeft && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSalaryClick}
              className="rounded-full text-xs hover:bg-gray-100 px-3 h-7"
            >
              Salary Info
            </Button>
            {!isReadOnly && isSuperAdmin && onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                disabled={isLoading}
                className="h-7 w-7 hover:bg-blue-100 rounded-full text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-3 w-3" />
                <span className="sr-only">Edit Employee</span>
              </Button>
            )}
            {!isReadOnly && isSuperAdmin && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(employee._id)}
                disabled={isLoading}
                className="h-7 w-7 hover:bg-red-100 rounded-full text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete Employee</span>
              </Button>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isSalaryModalOpen}
        onClose={() => {
          setIsSalaryModalOpen(false);
          setIsEditingSalary(false);
          setNewSalary('');
        }}
        title="Salary Information"
      >
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : salaryHistory ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{salaryHistory.employee.name}</h3>
                <p className="text-gray-600">{salaryHistory.employee.position}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isEditingSalary ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={newSalary}
                          onChange={(e) => setNewSalary(e.target.value)}
                          placeholder="Enter new salary"
                          className="w-32"
                        />
                        <Button
                          size="sm"
                          onClick={handleSalaryEdit}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {isLoading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditingSalary(false);
                            setNewSalary('');
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 font-medium">
                      Monthly Salary: {formatSalary(salaryHistory.employee.salary)}
                      {(!salaryHistory.employee.salary || salaryHistory.employee.salary === 0) && (
                        <span className="text-sm text-gray-500 ml-2">(Not set)</span>
                      )}
                    </p>
                        {isSuperAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setIsEditingSalary(true);
                              setNewSalary(salaryHistory.employee.salary?.toString() || '');
                            }}
                            className="ml-2"
                          >
                            <PencilLine className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Current Month Salary Status
                        </h4>
                        <p className="text-sm text-gray-600">
                          {format(new Date(), 'MMMM yyyy')}
                        </p>
                      </div>
                      {currentMonthPaid ? (
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          <span className="text-green-600 font-medium">Salary Paid</span>
                        </div>
                      ) : isFirstDayOfMonth ? (
                        <Button
                          onClick={handlePaySalary}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Pay Now ({formatSalary(salaryHistory.employee.salary)})
                        </Button>
                      ) : (
                        <span className="text-yellow-600 font-medium">
                          Payment available on 1st of month
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Salary History</h4>
                <div className="space-y-2">
                  {salaryHistory.salaryHistory.map((record, index) => (
                    <div
                      key={index}
                      className="bg-white border rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {format(new Date(record.month + '-01'), 'MMMM yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Paid on: {format(new Date(record.date), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          {formatSalary(record.amount)}
                        </p>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Paid
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">Failed to load salary information</div>
          )}
        </div>
      </Modal>
    </Card>
  );
}
