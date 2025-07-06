// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'employee';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// Employee Types
export interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department?: string;
  address?: string;
  dateOfBirth?: string;
  salary?: number;
  emergencyContact?: string;
  joinDate?: string;
  isActive: boolean;
  currentStatus: 'checked_in' | 'checked_out';
  lastPunchIn?: string;
  lastPunchOut?: string;
  createdAt: string;
  updatedAt: string;
  isLeaving?: boolean;
  leavingDate?: string;
  salaryHistory?: SalaryRecord[];
}

export interface CreateEmployeeData {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  joinDate?: string;
  isLeaving?: boolean;
  leavingDate?: string;
  salary?: number;
}

// Task Types
export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: Employee;
  assignedBy: User;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  price?: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  price?: number;
}

// Attendance Types
export interface Attendance {
  _id: string;
  employee: Employee;
  action: 'punch_in' | 'punch_out';
  timestamp: string;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PunchData {
  employeeId: string;
  action: 'punch_in' | 'punch_out';
  notes?: string;
}

// Salary Types
export interface SalaryRecord {
  amount: number;
  date: Date;
  month: string;
  status: 'pending' | 'paid';
}

export interface SalaryHistory {
  employee: {
    name: string;
    position: string;
    salary: number;
  };
  pendingSalary: SalaryRecord | null;
  salaryHistory: SalaryRecord[];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginationResponse<T = any> {
  success: boolean;
  data: {
    items: T[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalRecords: number;
    };
  };
}

// Socket Types
export interface SocketAttendanceUpdate {
  type: 'punch_update';
  data: Attendance;
}

export interface SocketEmployeeUpdate {
  type: 'employee_update';
  data: Employee;
}

export interface SocketTaskUpdate {
  type: 'task_update';
  data: Task;
}

// Component Props Types
export interface AttendanceCardProps {
  attendance: Attendance;
}

export interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
  isReadOnly?: boolean;
}

export interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isReadOnly?: boolean;
} 