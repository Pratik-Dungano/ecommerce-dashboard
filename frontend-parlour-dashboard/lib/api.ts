import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  ApiResponse,
  PaginationResponse,
  AuthResponse,
  LoginCredentials,
  User,
  Employee,
  CreateEmployeeData,
  Task,
  CreateTaskData,
  Attendance,
  PunchData,
  SalaryHistory,
} from '../types';

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parlour_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('parlour_token');
      localStorage.removeItem('parlour_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { 
    name: string; 
    email: string;
    phone: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.get<ApiResponse<{ user: User }>>('/auth/profile');
    return response.data;
  },

  getAllUsers: async (): Promise<ApiResponse<{ users: User[] }>> => {
    const response = await api.get<ApiResponse<{ users: User[] }>>('/auth/users');
    return response.data;
  },

  updateUserRole: async (userId: string, role: 'super_admin' | 'admin' | 'employee'): Promise<ApiResponse<{ user: User }>> => {
    const response = await api.patch<ApiResponse<{ user: User }>>(`/auth/users/${userId}/role`, { role });
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/auth/users/${userId}`);
    return response.data;
  },

  getUserStats: async (): Promise<ApiResponse<{ 
    totalUsers: number; 
    adminCount: number; 
    superAdminCount: number; 
    employeeCount: number; 
  }>> => {
    const response = await api.get<ApiResponse<{ 
      totalUsers: number; 
      adminCount: number; 
      superAdminCount: number; 
      employeeCount: number; 
    }>>('/auth/users/stats');
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getAll: async (): Promise<ApiResponse<{ employees: Employee[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ employees: Employee[]; count: number }>>('/employees');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ employee: Employee }>> => {
    const response = await api.get<ApiResponse<{ employee: Employee }>>(`/employees/${id}`);
    return response.data;
  },

  create: async (employeeData: CreateEmployeeData): Promise<ApiResponse<{ employee: Employee }>> => {
    const response = await api.post<ApiResponse<{ employee: Employee }>>('/employees', employeeData);
    return response.data;
  },

  update: async (id: string, employeeData: Partial<CreateEmployeeData>): Promise<ApiResponse<{ employee: Employee }>> => {
    const response = await api.put<ApiResponse<{ employee: Employee }>>(`/employees/${id}`, employeeData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/employees/${id}`);
    return response.data;
  },

  moveToPreviousStaff: async (id: string, data: { reasonForLeaving?: string; performanceRating?: number }): Promise<ApiResponse<{ 
    movedToPreviousStaff: boolean; 
    userDeleted: boolean; 
    employeeDeleted: boolean; 
    salaryData?: { 
      totalIncome: number; 
      paidIncome: number; 
      pendingIncome: number; 
    } 
  }>> => {
    const response = await api.post<ApiResponse<{ 
      movedToPreviousStaff: boolean; 
      userDeleted: boolean; 
      employeeDeleted: boolean; 
      salaryData?: { 
        totalIncome: number; 
        paidIncome: number; 
        pendingIncome: number; 
      } 
    }>>(`/employees/${id}/move-to-previous-staff`, data);
    return response.data;
  },

  manualCleanupLeftEmployees: async (): Promise<ApiResponse<{ 
    processedCount: number; 
    processedEmployees: Array<{
      name: string;
      email: string;
      leavingDate: string;
      totalIncome: number;
      paidIncome: number;
      pendingIncome: number;
    }>
  }>> => {
    const response = await api.post<ApiResponse<{ 
      processedCount: number; 
      processedEmployees: Array<{
        name: string;
        email: string;
        leavingDate: string;
        totalIncome: number;
        paidIncome: number;
        pendingIncome: number;
      }>
    }>>('/employees/cleanup-left-employees');
    return response.data;
  },
};

// Task API
export const taskAPI = {
  getAll: async (): Promise<ApiResponse<{ tasks: Task[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; count: number }>>('/tasks');
    return response.data;
  },

  getById: async (id: string): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.get<ApiResponse<{ task: Task }>>(`/tasks/${id}`);
    return response.data;
  },

  getByEmployee: async (employeeId: string): Promise<ApiResponse<{ tasks: Task[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; count: number }>>(`/tasks/employee/${employeeId}`);
    return response.data;
  },

  getMyTasks: async (): Promise<ApiResponse<{ tasks: Task[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ tasks: Task[]; count: number }>>('/tasks/my-tasks');
    return response.data;
  },

  create: async (taskData: CreateTaskData): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.post<ApiResponse<{ task: Task }>>('/tasks', taskData);
    return response.data;
  },

  update: async (id: string, taskData: Partial<CreateTaskData & { status: string }>): Promise<ApiResponse<{ task: Task }>> => {
    const response = await api.put<ApiResponse<{ task: Task }>>(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/tasks/${id}`);
    return response.data;
  },

  getTaskStats: async (): Promise<ApiResponse<{ 
    incompleteTasks: number; 
    highPriorityTasks: number; 
    mediumPriorityTasks: number; 
    lowPriorityTasks: number; 
  }>> => {
    const response = await api.get<ApiResponse<{ 
      incompleteTasks: number; 
      highPriorityTasks: number; 
      mediumPriorityTasks: number; 
      lowPriorityTasks: number; 
    }>>('/tasks/stats');
    return response.data;
  },

  getRevenue: async (): Promise<ApiResponse<{ 
    totalEarned: number;
    totalSalaryGiven: number;
    netRevenue: number;
    completedTasksCount: number;
    totalSalaryRecords: number;
    employeesPaidThisMonth: number;
    currentMonthSalary: number;
    totalEmployees: number;
    currentMonth: string;
  }>> => {
    const response = await api.get<ApiResponse<{ 
      totalEarned: number;
      totalSalaryGiven: number;
      netRevenue: number;
      completedTasksCount: number;
      totalSalaryRecords: number;
      employeesPaidThisMonth: number;
      currentMonthSalary: number;
      totalEmployees: number;
      currentMonth: string;
    }>>('/tasks/revenue');
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  getAll: async (params?: { page?: number; limit?: number; employeeId?: string; date?: string }): Promise<PaginationResponse<Attendance>> => {
    const response = await api.get<PaginationResponse<Attendance>>('/attendance', { params });
    return response.data;
  },

  getToday: async (): Promise<ApiResponse<{ attendance: Attendance[]; count: number; date: string }>> => {
    const response = await api.get<ApiResponse<{ attendance: Attendance[]; count: number; date: string }>>('/attendance/today');
    return response.data;
  },

  getByEmployee: async (employeeId: string, params?: { startDate?: string; endDate?: string }): Promise<ApiResponse<{ attendance: Attendance[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ attendance: Attendance[]; count: number }>>(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },

  getMyAttendance: async (): Promise<ApiResponse<{ attendance: Attendance[]; count: number }>> => {
    const response = await api.get<ApiResponse<{ attendance: Attendance[]; count: number }>>('/attendance/my-attendance');
    return response.data;
  },

  punch: async (punchData: PunchData): Promise<ApiResponse<{ attendance: Attendance }>> => {
    const response = await api.post<ApiResponse<{ attendance: Attendance }>>('/attendance/punch', punchData);
    return response.data;
  },

  getAttendanceStats: async (): Promise<ApiResponse<{ 
    totalEmployees: number; 
    presentEmployees: number; 
    attendancePercentage: number; 
    date: string; 
  }>> => {
    const response = await api.get<ApiResponse<{ 
      totalEmployees: number; 
      presentEmployees: number; 
      attendancePercentage: number; 
      date: string; 
    }>>('/attendance/stats');
    return response.data;
  },
};

// Salary API
export const salaryAPI = {
  getHistory: async (employeeId: string): Promise<ApiResponse<SalaryHistory>> => {
    try {
      const response = await api.get<ApiResponse<SalaryHistory>>(`/salary/${employeeId}`);
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Employee salary information not found');
      }
      throw error;
    }
  },

  pay: async (employeeId: string): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>(`/salary/${employeeId}/pay`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Salary for current month already paid');
      }
      throw error;
    }
  },

  update: async (employeeId: string, newSalary: number): Promise<ApiResponse> => {
    if (newSalary < 0) {
      throw new Error('Salary cannot be negative');
    }
    const response = await api.patch<ApiResponse>(`/employees/${employeeId}/salary`, { salary: newSalary });
    return response.data;
  }
};

// Replace old functions with new API object
export const getSalaryHistory = salaryAPI.getHistory;
export const paySalary = salaryAPI.pay;
export const updateEmployeeSalary = salaryAPI.update;

// Generic API helper functions
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('parlour_token', token);
  // Also set as cookie for middleware
  document.cookie = `parlour_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('parlour_token');
  localStorage.removeItem('parlour_user');
  // Also remove cookie
  document.cookie = 'parlour_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('parlour_token');
};

// Employee endpoints - Updated to handle both User and Employee deletion
export const deleteEmployee = async (employeeId: string) => {
  try {
    // First get the employee to find their email
    const employeeResponse = await employeeAPI.getById(employeeId);
    if (!employeeResponse.success || !employeeResponse.data) {
      throw new Error('Employee not found');
    }

    const employee = employeeResponse.data.employee;
    
    // Get all users to find the user with matching email
    const usersResponse = await authAPI.getAllUsers();
    if (!usersResponse.success || !usersResponse.data) {
      throw new Error('Failed to fetch users');
    }

    const user = usersResponse.data.users.find(u => u.email === employee.email);
    
    if (user) {
      // Delete from User database using the auth API
      await authAPI.deleteUser(user.id);
    } else {
      // If no user found, just delete the employee record
      await employeeAPI.delete(employeeId);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

// Mark employee as leaving
export const markEmployeeAsLeaving = async (
  employeeId: string,
  leavingDate?: string,
  reasonForLeaving?: string
): Promise<ApiResponse<any>> => {
  const response = await fetch(`${API_BASE_URL}/employees/${employeeId}/mark-leaving`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      leavingDate,
      reasonForLeaving,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark employee as leaving');
  }

  return response.json();
};

// Analytics API
export const analyticsAPI = {
  getRevenueTrends: async (period: 'day' | 'week' | 'month' = 'month'): Promise<ApiResponse<{ 
    trends: Array<{
      period: string;
      revenue: number;
      tasks: number;
      avgRevenue?: number;
    }>;
    period: string;
  }>> => {
    const response = await api.get<ApiResponse<{ 
      trends: Array<{
        period: string;
        revenue: number;
        tasks: number;
        avgRevenue?: number;
      }>;
      period: string;
    }>>(`/analytics/revenue-trends?period=${period}`);
    return response.data;
  },

  getSalaryDistribution: async (): Promise<ApiResponse<{
    salaryRanges: Array<{
      range: string;
      count: number;
      totalSalary: number;
    }>;
    departmentSalaries: Array<{
      department: string;
      employeeCount: number;
      totalSalary: number;
      avgSalary: number;
    }>;
    totalSalaryPaid: number;
    totalEmployees: number;
  }>> => {
    const response = await api.get<ApiResponse<{
      salaryRanges: Array<{
        range: string;
        count: number;
        totalSalary: number;
      }>;
      departmentSalaries: Array<{
        department: string;
        employeeCount: number;
        totalSalary: number;
        avgSalary: number;
      }>;
      totalSalaryPaid: number;
      totalEmployees: number;
    }>>('/analytics/salary-distribution');
    return response.data;
  },

  getTaskAnalytics: async (): Promise<ApiResponse<{
    statusDistribution: Array<{
      _id: string;
      count: number;
      totalValue?: number;
    }>;
    priorityDistribution: Array<{
      _id: string;
      count: number;
      completed: number;
    }>;
    categoryAnalysis: Array<{
      _id: string;
      total: number;
      completed: number;
      revenue: number;
    }>;
    completionTrends: Array<{
      period: string;
      completed: number;
      revenue: number;
    }>;
  }>> => {
    const response = await api.get<ApiResponse<{
      statusDistribution: Array<{
        _id: string;
        count: number;
        totalValue?: number;
      }>;
      priorityDistribution: Array<{
        _id: string;
        count: number;
        completed: number;
      }>;
      categoryAnalysis: Array<{
        _id: string;
        total: number;
        completed: number;
        revenue: number;
      }>;
      completionTrends: Array<{
        period: string;
        completed: number;
        revenue: number;
      }>;
    }>>('/analytics/task-analytics');
    return response.data;
  },

  getEmployeePerformance: async (): Promise<ApiResponse<{
    topPerformers: Array<{
      employeeName: string;
      employeePosition: string;
      employeeDepartment: string;
      completedTasks: number;
      totalRevenue: number;
      avgRevenuePerTask: number;
    }>;
    attendanceLeaders: Array<{
      name: string;
      position: string;
      department: string;
      currentStatus: string;
      totalPunchIns: number;
      recentAttendance: number;
    }>;
    departmentPerformance: Array<{
      department: string;
      completedTasks: number;
      totalRevenue: number;
      employeeCount: number;
      avgTasksPerEmployee: number;
      avgRevenuePerEmployee: number;
    }>;
    totalEmployees: number;
  }>> => {
    const response = await api.get<ApiResponse<{
      topPerformers: Array<{
        employeeName: string;
        employeePosition: string;
        employeeDepartment: string;
        completedTasks: number;
        totalRevenue: number;
        avgRevenuePerTask: number;
      }>;
      attendanceLeaders: Array<{
        name: string;
        position: string;
        department: string;
        currentStatus: string;
        totalPunchIns: number;
        recentAttendance: number;
      }>;
      departmentPerformance: Array<{
        department: string;
        completedTasks: number;
        totalRevenue: number;
        employeeCount: number;
        avgTasksPerEmployee: number;
        avgRevenuePerEmployee: number;
      }>;
      totalEmployees: number;
    }>>('/analytics/employee-performance');
    return response.data;
  },

  getDashboardAnalytics: async (): Promise<ApiResponse<{
    revenueTrends: any;
    salaryDistribution: any;
    taskAnalytics: any;
    employeePerformance: any;
  }>> => {
    const response = await api.get<ApiResponse<{
      revenueTrends: any;
      salaryDistribution: any;
      taskAnalytics: any;
      employeePerformance: any;
    }>>('/analytics/dashboard');
    return response.data;
  },
};

export default api; 