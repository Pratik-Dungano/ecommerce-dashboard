import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  _id: string;
  employee: mongoose.Types.ObjectId;
  action: 'punch_in' | 'punch_out';
  timestamp: Date;
  ipAddress?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
    },
    action: {
      type: String,
      enum: ['punch_in', 'punch_out'],
      required: [true, 'Action type is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    location: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
AttendanceSchema.index({ employee: 1, timestamp: -1 });
AttendanceSchema.index({ action: 1, timestamp: -1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema); 