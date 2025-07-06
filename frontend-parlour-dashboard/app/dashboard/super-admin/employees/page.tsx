'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import EmployeeForm from "@/components/EmployeeForm";
import { employeeAPI, handleApiError, deleteEmployee } from "@/lib/api";
import { Employee, CreateEmployeeData, ApiResponse } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { EmployeeCard } from '@/components/EmployeeCard';
import { AddUserModal } from '@/components/AddUserModal';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
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

  const handleAddEmployee = () => {
    setIsAddModalOpen(true);
  };

  const handleEditEmployee = async (employee: Employee) => {
    try {
      // Fetch fresh employee data to ensure we have the latest salary information
      const response = await employeeAPI.getById(employee._id);
      if (response.success && response.data) {
        setSelectedEmployee(response.data.employee);
        setIsEditModalOpen(true);
      } else {
        setSelectedEmployee(employee);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching fresh employee data:', error);
      // Fallback to using the current employee data
      setSelectedEmployee(employee);
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;

    try {
      setIsLoading(true);
      await deleteEmployee(employeeToDelete._id);
      setEmployees(prev => prev.filter(emp => emp._id !== employeeToDelete._id));
      toast({
        title: 'User Deleted',
        description: 'The user and employee have been removed from the system.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEmployeeToDelete(null);
  };

  const handleEditSubmit = async (data: CreateEmployeeData) => {
    try {
      setIsLoading(true);
      if (selectedEmployee) {
        await employeeAPI.update(selectedEmployee._id, data);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      }
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
      await fetchEmployees();
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
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <p className="text-gray-600">Manage all employees across all branches</p>
        </div>
        <Button onClick={handleAddEmployee} disabled={isLoading}>
          + Add New Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onEdit={handleEditEmployee}
            onDelete={() => handleDeleteClick(employee)}
            onEmployeeUpdate={fetchEmployees}
            isSuperAdmin={true}
          />
        ))}
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchEmployees}
        defaultRole="employee"
      />

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Edit Employee"
      >
        <EmployeeForm
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          initialData={selectedEmployee || undefined}
          isLoading={isLoading}
          isSuperAdmin={true}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={handleDeleteCancel} />
          <Card className="relative z-50 w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Delete Employee</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete <strong>{employeeToDelete.name}</strong>? 
                This will remove them from both the user and employee databases permanently.
              </p>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
                className="font-bold text-red-600 bg-red-50 border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 