'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { taskAPI, employeeAPI } from '../../../lib/api';
import { isSuperAdmin } from '../../../utils/auth';
import { Task, Employee } from '../../../types';

interface TaskFormData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const TasksPage = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });

  const isSuper = isSuperAdmin();
  const priorities = ['low', 'medium', 'high'];
  const statuses = ['pending', 'in_progress', 'completed', 'cancelled'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadTasks(),
        loadEmployees(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await taskAPI.getAll();
      if (response.success && response.data?.tasks) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeAPI.getAll();
      if (response.success && response.data?.employees) {
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuper) return;

    try {
      if (editingTask) {
        // Update existing task
        const response = await taskAPI.update(editingTask._id, formData);
        if (response.success) {
          await loadTasks();
          resetForm();
        }
      } else {
        // Create new task
        const response = await taskAPI.create(formData);
        if (response.success) {
          await loadTasks();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleEdit = (task: Task) => {
    if (!isSuper) return;
    
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo._id,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!isSuper || !confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await taskAPI.delete(taskId);
      if (response.success) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!isSuper) return;

    try {
      const response = await taskAPI.update(taskId, { status: newStatus });
      if (response.success) {
        await loadTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assignedTo: '',
      priority: 'medium',
      dueDate: '',
    });
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-white rounded-2xl shadow-elegant p-6 card-hover border border-gray-100 group relative">
      {/* Priority Indicator */}
      <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
      
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors pr-6">
            {task.title}
          </h3>
          <span className="text-2xl">{getPriorityIcon(task.priority)}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {task.description}
        </p>
      </div>

      {/* Assigned Employee */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-soft">
          <span className="text-white text-sm">👤</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{task.assignedTo.name}</p>
          <p className="text-xs text-gray-500">{task.assignedTo.position}</p>
        </div>
      </div>

      {/* Status and Due Date */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Priority: <span className="capitalize">{task.priority}</span>
          </span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 mr-2">📅</span>
            Due: {formatDate(task.dueDate)}
          </div>
        )}
        
        <div className="flex items-center text-sm text-gray-600">
          <span className="w-4 mr-2">📝</span>
          Created: {formatDate(task.createdAt)}
        </div>
      </div>

      {/* Status Update Buttons */}
      {isSuper && task.status !== 'completed' && task.status !== 'cancelled' && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {task.status === 'assigned' && (
            <button
              onClick={() => handleStatusChange(task._id, 'in_progress')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300"
            >
              ▶️ Start
            </button>
          )}
          
          {task.status === 'in_progress' && (
            <button
              onClick={() => handleStatusChange(task._id, 'completed')}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300"
            >
              ✅ Complete
            </button>
          )}
          
          <button
            onClick={() => handleStatusChange(task._id, 'cancelled')}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white text-sm font-semibold py-2 px-3 rounded-xl transition-all duration-300"
          >
            ❌ Cancel
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {isSuper && (
        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleEdit(task)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => handleDelete(task._id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105"
          >
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-soft">
              <span className="text-2xl text-white">📋</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Task Management</h1>
              <p className="text-lg text-gray-600">Assign and track tasks for your team</p>
            </div>
          </div>

          {isSuper && (
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="btn-primary flex items-center space-x-2 shadow-elegant"
            >
              <span className="text-xl">➕</span>
              <span>Create Task</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                <p className="text-sm text-gray-600">Total Tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⏳</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status === 'assigned').length}
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">⚡</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status === 'in_progress').length}
                </p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {tasks.filter(task => task.status === 'completed').length}
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              >
                <option value="all">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
              >
                <option value="all">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                🔄 Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first task.'
              }
            </p>
            {isSuper && !searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={() => {
                  resetForm();
                  setIsModalOpen(true);
                }}
                className="btn-primary"
              >
                ➕ Create First Task
              </button>
            )}
          </div>
        )}

        {/* Task Modal */}
        {isModalOpen && isSuper && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-dramatic max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-modern"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-modern h-32 resize-none"
                    placeholder="Describe the task in detail"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assign To *</label>
                    <select
                      required
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                      className="input-modern"
                    >
                      <option value="">Select employee</option>
                      {employees.map(employee => (
                        <option key={employee._id} value={employee._id}>
                          {employee.name} - {employee.position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority *</label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="input-modern"
                    >
                      <option value="low">🌱 Low</option>
                      <option value="medium">⚡ Medium</option>
                      <option value="high">🔥 High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input-modern"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
