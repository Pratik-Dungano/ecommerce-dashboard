import { Server as SocketIOServer } from 'socket.io';

declare global {
  namespace Express {
    interface Application {
      set(setting: string, val: any): this;
      get(setting: string): any;
    }
  }
} 