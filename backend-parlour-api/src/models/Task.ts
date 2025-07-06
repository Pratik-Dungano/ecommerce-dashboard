import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  _id: string;
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  status: 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  price?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Task must be assigned to an employee'],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have an assigner'],
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'cancelled'],
      default: 'assigned',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    price: {
      type: Number,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITask>('Task', TaskSchema);
