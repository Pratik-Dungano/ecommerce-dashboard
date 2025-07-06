'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { employeeAPI, handleApiError } from "@/lib/api";
import { Employee, ApiResponse } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeCard } from '@/components/EmployeeCard';
import { motion } from "framer-motion";

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeAPI.getAll() as ApiResponse<{ employees: Employee[] }>;
      if (response.data) {
        setEmployees(response.data.employees);
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
    fetchEmployees();
  }, []);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Branch Employee Overview</h1>
          <p className="text-gray-600 text-lg">View and monitor your branch employees and their information</p>
        </div>
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">👥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-800">{employees.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-gray-800">
                {employees.filter(emp => emp.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
              <span className="text-xl text-white">💰</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Salary</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{employees.length > 0 
                  ? Math.round(employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / employees.length).toLocaleString()
                  : '0'
                }
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Employees Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {employees.map((employee, index) => (
          <motion.div
            key={employee._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
          >
            <EmployeeCard
              employee={employee}
              onEdit={() => {}}
              onDelete={() => {}}
              onEmployeeUpdate={fetchEmployees}
              isSuperAdmin={false}
              readOnly={true}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {!isLoading && employees.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👥</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Employees Found</h3>
          <p className="text-gray-600">There are no employees assigned to your branch at the moment.</p>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && employees.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 