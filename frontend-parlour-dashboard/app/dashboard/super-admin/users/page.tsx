'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authAPI, handleApiError } from "@/lib/api";
import { User } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader2, ChevronDown } from "lucide-react";
import { AddUserModal } from "@/components/AddUserModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [expandedRoleId, setExpandedRoleId] = useState<string | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const { toast } = useToast();

  // Add ref for click outside detection
  const roleButtonsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (expandedRoleId) {
        const roleButtonsElement = roleButtonsRef.current[expandedRoleId];
        if (roleButtonsElement && !roleButtonsElement.contains(event.target as Node)) {
          setExpandedRoleId(null);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedRoleId]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getAllUsers();
      if (response.success && response.data) {
        setUsers(response.data.users);
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

  const handleRoleChange = async (userId: string, newRole: 'super_admin' | 'admin' | 'employee') => {
    try {
      setUpdatingUserId(userId);
      const response = await authAPI.updateUserRole(userId, newRole);
      if (response.success && response.data?.user) {
        setUsers(users.map(user => 
          user.id === userId ? response.data.user : user
        ));
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
        setExpandedRoleId(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeletingUser(true);
      const response = await authAPI.deleteUser(userToDelete.id);
      if (response.success) {
        setUsers(users.filter(u => u.id !== userToDelete.id));
        toast({
          title: "Success",
          description: "User deleted successfully from both User and Employee databases",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: handleApiError(error),
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      setIsDeletingUser(false);
    }
  };

  const cancelDeleteUser = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '👑';
      case 'admin':
        return '👤';
      default:
        return '👨‍💼';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Management</h2>
          <p className="mt-1 text-sm text-gray-500">Manage user accounts and access levels</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setIsAddUserModalOpen(true)}
        >
          Add New User
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card key={user.id} className="flex flex-col p-4 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                    <span className="text-2xl">{getRoleIcon(user.role)}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{user.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </div>
                <span className={`ml-2 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getRoleBadgeClass(user.role)}`}>
                  {formatRole(user.role)}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-end space-y-3">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 mr-2">Created:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <div 
                    className="relative" 
                    ref={(el) => {
                      roleButtonsRef.current[user.id] = el;
                    }}
                  >
                    {expandedRoleId === user.id ? (
                      <div className="grid grid-cols-3 gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={`${user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'hover:bg-purple-50 hover:text-purple-700'}`}
                          onClick={() => handleRoleChange(user.id, 'super_admin')}
                          disabled={user.role === 'super_admin' || updatingUserId === user.id}
                        >
                          Super Admin
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className={`${user.role === 'admin' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'hover:bg-blue-50 hover:text-blue-700'}`}
                          onClick={() => handleRoleChange(user.id, 'admin')}
                          disabled={user.role === 'admin' || updatingUserId === user.id}
                        >
                          Admin
                        </Button>
                        <Button 
                          variant="outline"
                          size="sm"
                          className={`${user.role === 'employee' ? 'bg-gray-100 text-gray-800 border-gray-200' : 'hover:bg-gray-50 hover:text-gray-700'}`}
                          onClick={() => handleRoleChange(user.id, 'employee')}
                          disabled={user.role === 'employee' || updatingUserId === user.id}
                        >
                          Employee
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="w-full h-9 px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                        onClick={() => setExpandedRoleId(user.id)}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Change Role
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-9 px-3 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDeleteUser(user)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No users found</div>
        </div>
      )}

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={fetchUsers}
      />

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={cancelDeleteUser} />
          <Card className="relative z-50 w-full max-w-md p-6 mx-4 bg-white rounded-lg shadow-xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Delete User</h2>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete <strong>{userToDelete.name}</strong>? 
                This action cannot be undone and will permanently remove the user from both the User and Employee databases.
              </p>
            </div>
            <div className="flex space-x-2 justify-end">
              <Button
                variant="outline"
                onClick={cancelDeleteUser}
                disabled={isDeletingUser}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-red-50 border-red-600 hover:border-red-700 font-semibold"
                onClick={confirmDeleteUser}
                disabled={isDeletingUser}
              >
                {isDeletingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2 text-red-50" />
                    <span className="text-red-50">Deleting...</span>
                  </>
                ) : (
                  <span className="text-red-50">Delete</span>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 