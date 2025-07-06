'use client';

import { useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { User } from '@/types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authAPI.getAllUsers();
      if (response.success) {
        setUsers(response.data.users);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: 'super_admin' | 'admin' | 'employee') => {
    try {
      const response = await authAPI.updateUserRole(userId, role);
      if (response.success) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role } : user
        ));
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to update user role' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred while updating user role' };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const response = await authAPI.deleteUser(userId);
      if (response.success) {
        setUsers(prev => prev.filter(user => user._id !== userId));
        return { success: true };
      } else {
        return { success: false, error: response.message || 'Failed to delete user' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred while deleting user' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    deleteUser
  };
}; 