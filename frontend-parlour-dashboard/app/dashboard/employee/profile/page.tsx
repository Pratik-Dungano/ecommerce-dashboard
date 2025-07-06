'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { employeeAPI, salaryAPI, handleApiError } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Employee, SalaryHistory } from "@/types";

export default function EmployeeProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [salaryHistory, setSalaryHistory] = useState<SalaryHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployeeData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Get all employees and find the one with matching email
      const employeesResponse = await employeeAPI.getAll();
      if (employeesResponse.success && employeesResponse.data?.employees) {
        const foundEmployee = employeesResponse.data.employees.find(
          (emp: Employee) => emp.email === user.email
        );
        
        if (foundEmployee) {
          // Get complete employee details by ID to ensure we have all fields
          try {
            const employeeResponse = await employeeAPI.getById(foundEmployee._id);
            if (employeeResponse.success && employeeResponse.data?.employee) {
              setEmployee(employeeResponse.data.employee);
            } else {
              setEmployee(foundEmployee);
            }
          } catch (error) {
            console.log('Using employee data from getAll response');
            setEmployee(foundEmployee);
          }
          
          // Get salary history for this employee
          try {
            const salaryResponse = await salaryAPI.getHistory(foundEmployee._id);
            if (salaryResponse.success && salaryResponse.data) {
              setSalaryHistory(salaryResponse.data);
            }
          } catch (salaryError) {
            console.log('No salary history found for employee');
          }
        }
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
    fetchEmployeeData();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center py-8">
          <p className="text-gray-600">Loading profile information...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center py-8">
          <p className="text-gray-600">Employee information not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600">View and manage your employee information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-800 font-medium">{employee.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800 font-medium">{employee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-800 font-medium">{employee.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                <p className="text-gray-800 font-medium">
                  {employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-800 font-medium">{employee.address || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                <p className="text-gray-800 font-medium">{employee.emergencyContact || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Employment Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Employee ID</label>
                <p className="text-gray-800 font-medium">{employee._id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Position</label>
                <p className="text-gray-800 font-medium">{employee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Department</label>
                <p className="text-gray-800 font-medium">{employee.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Joining Date</label>
                <p className="text-gray-800 font-medium">
                  {employee.joinDate ? formatDate(employee.joinDate) : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Current Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  employee.currentStatus === 'checked_in' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {employee.currentStatus === 'checked_in' ? 'Checked In' : 'Checked Out'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Employment Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          {/* Salary Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Salary Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Current Salary</label>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(employee.salary || 0)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Frequency</label>
                <p className="text-gray-800 font-medium">Monthly</p>
              </div>
            </div>

            {/* Salary History */}
            {salaryHistory && salaryHistory.salaryHistory && salaryHistory.salaryHistory.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Salary History</h3>
                <div className="space-y-3">
                  {salaryHistory.salaryHistory.map((payment: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">
                          {formatDate(payment.date)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.month}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {payment.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="p-6 text-center">
            <div className="h-24 w-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">👨‍💼</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{employee.name}</h3>
            <p className="text-gray-600">{employee.position}</p>
            <p className="text-sm text-gray-500">{employee.department}</p>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-medium">{employee._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joining Date:</span>
                <span className="font-medium">
                  {employee.joinDate ? formatDate(employee.joinDate) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Salary:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(employee.salary || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  employee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-800">{employee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-800">{employee.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                <p className="text-gray-800">{employee.emergencyContact || 'Not provided'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 