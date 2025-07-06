import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyToken } from '../utils/jwt';

interface AttendanceData {
  employee: string;
  action: 'punch_in' | 'punch_out';
  timestamp: Date;
}

interface ServerToClientEvents {
  attendance_update: (data: { type: string; data: AttendanceData }) => void;
  employee_status_response: (data: { employeeId: string; status: string }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  attendance_update: (data: AttendanceData) => void;
  subscribe_attendance: (employeeId: string) => void;
  unsubscribe_attendance: (employeeId: string) => void;
  get_employee_status: (employeeId: string) => void;
}

export const setupAttendanceSocket = (io: Server) => {
  const attendanceNamespace = io.of('/attendance');

  attendanceNamespace.on('connection', (socket) => {
    console.log('Client connected to attendance socket');

    // Join room based on user role
    if (socket.data.user) {
      const { role } = socket.data.user;
      socket.join(`${role}_dashboard`);
      console.log(`👤 User joined ${role} dashboard room`);
    }

    // Join general attendance room
    socket.join('attendance_updates');

    socket.on('subscribe_attendance', (employeeId: string) => {
      socket.join(`attendance_${employeeId}`);
      console.log(`Subscribed to attendance updates for employee ${employeeId}`);
    });

    socket.on('unsubscribe_attendance', (employeeId: string) => {
      socket.leave(`attendance_${employeeId}`);
      console.log(`Unsubscribed from attendance updates for employee ${employeeId}`);
    });

    socket.on('get_employee_status', (employeeId: string) => {
      try {
        // Here you would typically fetch the employee status from your database
        attendanceNamespace.emit('employee_status_response', {
          employeeId,
          status: 'checked_in' // This should come from your database
        });
      } catch (error) {
        socket.emit('error', {
          message: 'Failed to get employee status'
        });
      }
    });

    socket.on('attendance_update', (data: AttendanceData) => {
      // Broadcast the attendance update to all connected clients
      attendanceNamespace.emit('attendance_update', {
        type: 'punch_update',
        data: data
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from attendance socket');
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // Broadcast methods for attendance updates
  const broadcastAttendanceUpdate = (data: any) => {
    io.to('attendance_live').emit('attendance_update', data);
    io.to('admin_dashboard').emit('attendance_update', data);
    io.to('super_admin_dashboard').emit('attendance_update', data);
  };

  const broadcastEmployeeUpdate = (data: any) => {
    io.to('admin_dashboard').emit('employee_update', data);
    io.to('super_admin_dashboard').emit('employee_update', data);
  };

  const broadcastTaskUpdate = (data: any) => {
    io.to('admin_dashboard').emit('task_update', data);
    io.to('super_admin_dashboard').emit('task_update', data);
  };

  // Attach broadcast methods to io instance for use in controllers
  (io as any).broadcastAttendanceUpdate = broadcastAttendanceUpdate;
  (io as any).broadcastEmployeeUpdate = broadcastEmployeeUpdate;
  (io as any).broadcastTaskUpdate = broadcastTaskUpdate;

  console.log('✅ WebSocket server initialized');
}; 