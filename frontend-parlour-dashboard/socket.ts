'use client';

import { io, Socket } from 'socket.io-client';
import { getToken } from './utils/auth';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = getToken();
    const serverUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

    this.socket = io(serverUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to Parlour WebSocket');
      this.reconnectAttempts = 0;
      
      // Subscribe to live attendance updates
      this.socket?.emit('subscribe_attendance');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('⚠️ Disconnected from WebSocket:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('👋 Disconnected from WebSocket');
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Subscribe to attendance updates
  subscribeToAttendance(callback: (data: any) => void): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('attendance_update', callback);
  }

  // Subscribe to employee updates
  subscribeToEmployees(callback: (data: any) => void): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('employee_update', callback);
  }

  // Subscribe to task updates
  subscribeToTasks(callback: (data: any) => void): void {
    if (!this.socket) {
      this.connect();
    }
    
    this.socket?.on('task_update', callback);
  }

  // Unsubscribe from all events
  unsubscribeAll(): void {
    this.socket?.off('attendance_update');
    this.socket?.off('employee_update');
    this.socket?.off('task_update');
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager; 