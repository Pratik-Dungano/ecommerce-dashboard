import mongoose, { Document, Schema } from 'mongoose';

interface SalaryRecord {
  amount: number;
  date: Date;
  month: string; // Format: "YYYY-MM"
  status: 'pending' | 'paid';
}

export interface IPreviousStaff extends Document {
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  joinDate: Date;
  leavingDate: Date;
  totalIncome: number;
  paidIncome: number;
  pendingIncome: number;
  salaryHistory: SalaryRecord[];
  lastPosition: string;
  reasonForLeaving?: string;
  performanceRating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const previousStaffSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String, required: true },
  department: { type: String, required: true },
  address: String,
  dateOfBirth: String,
  emergencyContact: String,
  joinDate: { type: Date, required: true },
  leavingDate: { type: Date, required: true },
  totalIncome: { type: Number, required: true },
  paidIncome: { type: Number, required: true, default: 0 },
  pendingIncome: { type: Number, required: true, default: 0 },
  salaryHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    month: { type: String, required: true },
    status: { 
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending'
    }
  }],
  lastPosition: { type: String, required: true },
  reasonForLeaving: String,
  performanceRating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

export default mongoose.model<IPreviousStaff>('PreviousStaff', previousStaffSchema); 