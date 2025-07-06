import mongoose, { Document, Schema } from 'mongoose';

interface AttendanceLog {
  date: Date;
  punchIns: Date[];
  punchOuts: Date[];
  totalHours: number;
}

interface SalaryRecord {
  amount: number;
  date: Date;
  month: string; // Format: "YYYY-MM"
  status: 'pending' | 'paid';
}

export interface IEmployee extends Document {
  _id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  address?: string;
  dateOfBirth?: string;
  salary: number;
  emergencyContact?: string;
  joinDate: Date;
  isActive: boolean;
  currentStatus: 'checked_in' | 'checked_out';
  lastPunchIn?: Date;
  lastPunchOut?: Date;
  isLeaving: boolean;
  leavingDate?: Date;
  attendanceHistory: AttendanceLog[];
  salaryHistory: SalaryRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceLogSchema = new Schema<AttendanceLog>({
  date: {
    type: Date,
    required: true,
  },
  punchIns: [{
    type: Date,
    required: true,
  }],
  punchOuts: [{
    type: Date,
    required: true,
  }],
  totalHours: {
    type: Number,
    required: true,
  },
});

const EmployeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, 'Employee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    address: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    salary: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    emergencyContact: {
      type: String,
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required'],
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentStatus: {
      type: String,
      enum: ['checked_in', 'checked_out'],
      default: 'checked_out',
    },
    lastPunchIn: {
      type: Date,
      default: null,
    },
    lastPunchOut: {
      type: Date,
      default: null,
    },
    isLeaving: {
      type: Boolean,
      default: false,
    },
    leavingDate: {
      type: Date,
    },
    attendanceHistory: {
      type: [AttendanceLogSchema],
      default: [],
    },
    salaryHistory: {
      type: [{
        amount: { 
          type: Number, 
          required: true,
          min: 0
        },
        date: { 
          type: Date, 
          required: true 
        },
        month: { 
          type: String, 
          required: true,
          validate: {
            validator: function(v: string) {
              return /^\d{4}-\d{2}$/.test(v);
            },
            message: props => `${props.value} is not a valid month format (YYYY-MM)!`
          }
        },
        status: { 
          type: String,
          enum: ['pending', 'paid'],
          default: 'pending'
        }
      }],
      default: []
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IEmployee>('Employee', EmployeeSchema); 