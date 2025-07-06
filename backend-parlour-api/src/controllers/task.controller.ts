import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import { shouldEscalatePriority } from '../utils/priorityEscalation';
import Employee from '../models/Employee';
import { format } from 'date-fns';

export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Find all tasks and populate assignedTo field with employee details
    const tasks = await Task.find()
      .populate('assignedTo', 'name email position department _id')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    // Check and update priorities if needed
    const updatedTasks = await Promise.all(tasks.map(async (task) => {
      const newPriority = shouldEscalatePriority(task);
      if (newPriority !== task.priority) {
        task.priority = newPriority;
        await task.save();
      }
      return task;
    }));

    res.status(200).json({
      success: true,
      data: {
        tasks: updatedTasks,
        count: updatedTasks.length,
      },
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task: ITask | null = await Task.findById(id)
      .populate('assignedTo', 'name email position department')
      .populate('assignedBy', 'name email');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    // Check and update priority if needed
    const newPriority = shouldEscalatePriority(task);
    if (newPriority !== task.priority) {
      task.priority = newPriority;
      await task.save();
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, assignedTo, priority, dueDate, price } = req.body;
    const assignedBy = req.user?.userId;

    // Validate required fields
    if (!title || !description || !assignedTo || !dueDate) {
      res.status(400).json({
        success: false,
        message: 'Title, description, assignedTo, and dueDate are required',
      });
      return;
    }

    const newTask: ITask = new Task({
      title,
      description,
      assignedTo,
      assignedBy,
      priority: priority || 'medium',
      dueDate: new Date(dueDate),
      price: price || null,
    });

    await newTask.save();

    // Populate the response
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignedTo', 'name email position department')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: populatedTask },
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle status change to completed
    if (updateData.status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    const updatedTask: ITask | null = await Task.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email position department')
      .populate('assignedBy', 'name email');

    if (!updatedTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: { task: updatedTask },
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deletedTask: ITask | null = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTasksByEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;

    const tasks: ITask[] = await Task.find({ assignedTo: employeeId })
      .populate('assignedTo', 'name email position department')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error: any) {
    console.error('Get tasks by employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getMyTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Find the employee record for this user
    const employee = await Employee.findOne({ email: req.user?.email });
    
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Get tasks assigned to this employee
    const tasks: ITask[] = await Task.find({ assignedTo: employee._id })
      .populate('assignedTo', 'name email position department')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error: any) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get incomplete tasks (not completed or cancelled)
    const incompleteTasks = await Task.countDocuments({ 
      status: { $in: ['assigned', 'in_progress'] } 
    });

    // Get priority breakdown for incomplete tasks
    const highPriorityTasks = await Task.countDocuments({ 
      status: { $in: ['assigned', 'in_progress'] },
      priority: 'high'
    });

    const mediumPriorityTasks = await Task.countDocuments({ 
      status: { $in: ['assigned', 'in_progress'] },
      priority: 'medium'
    });

    const lowPriorityTasks = await Task.countDocuments({ 
      status: { $in: ['assigned', 'in_progress'] },
      priority: 'low'
    });

    res.status(200).json({
      success: true,
      data: {
        incompleteTasks,
        highPriorityTasks,
        mediumPriorityTasks,
        lowPriorityTasks,
      },
    });
  } catch (error: any) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get all completed tasks with prices
    const completedTasks = await Task.find({ 
      status: 'completed',
      price: { $exists: true, $ne: null, $gt: 0 }
    });

    // Calculate total revenue from completed tasks
    const totalEarned = completedTasks.reduce((sum, task) => {
      return sum + (task.price || 0);
    }, 0);

    // Get all employees and calculate total salary given from all history
    const employees = await Employee.find({});
    
    let totalSalaryGiven = 0;
    let totalSalaryRecords = 0;
    
    employees.forEach(employee => {
      if (employee.salaryHistory && employee.salaryHistory.length > 0) {
        employee.salaryHistory.forEach(record => {
          if (record.status === 'paid' && record.amount) {
            totalSalaryGiven += record.amount;
            totalSalaryRecords++;
          }
        });
      }
    });

    // Calculate net revenue
    const netRevenue = totalEarned - totalSalaryGiven;

    // Get current month data for additional info
    const currentMonth = format(new Date(), 'yyyy-MM');
    let currentMonthSalary = 0;
    let employeesPaidThisMonth = 0;
    
    employees.forEach(employee => {
      const paidThisMonth = employee.salaryHistory.find(record => 
        record.month === currentMonth && record.status === 'paid'
      );
      
      if (paidThisMonth) {
        currentMonthSalary += paidThisMonth.amount;
        employeesPaidThisMonth++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalEarned,
        totalSalaryGiven,
        netRevenue,
        completedTasksCount: completedTasks.length,
        totalSalaryRecords,
        employeesPaidThisMonth,
        currentMonthSalary,
        totalEmployees: employees.length,
        currentMonth
      },
    });
  } catch (error: any) {
    console.error('Get revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}; 