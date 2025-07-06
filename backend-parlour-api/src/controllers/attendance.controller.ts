import { Request, Response } from 'express';
import Attendance, { IAttendance } from '../models/Attendance';
import Employee, { IEmployee } from '../models/Employee';

// Helper function to calculate attendance stats
const getAttendanceStatsData = async () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // Get total active employees
  const totalEmployees = await Employee.countDocuments({ isActive: true });

  // Get employees who are currently checked in (last action was punch_in)
  const currentlyCheckedIn = await Employee.countDocuments({ 
    isActive: true, 
    currentStatus: 'checked_in' 
  });

  // Get unique employees who punched in today (for attendance tracking)
  const todaysPunchIns = await Attendance.distinct('employee', {
    action: 'punch_in',
    timestamp: { $gte: startOfDay, $lt: endOfDay },
  });

  // Verify that the employees who punched in are still active
  const activeEmployeesWhoCheckedIn = await Employee.countDocuments({
    _id: { $in: todaysPunchIns },
    isActive: true
  });

  const presentEmployees = activeEmployeesWhoCheckedIn;
  
  // Calculate attendance percentage based on currently checked-in employees
  // This gives real-time attendance status
  const attendancePercentage = totalEmployees > 0 ? Math.round((currentlyCheckedIn / totalEmployees) * 100) : 0;

  return {
    totalEmployees,
    presentEmployees, // Those who attended today (punched in at least once)
    currentlyCheckedIn, // Those currently at work (not punched out)
    attendancePercentage, // Percentage based on currently present employees
    date: startOfDay.toISOString().split('T')[0],
  };
};

export const getAllAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 50, employeeId, date } = req.query;

    // Build query filter
    const filter: any = {};
    if (employeeId) {
      filter.employee = employeeId;
    }
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.timestamp = { $gte: startDate, $lt: endDate };
    }

    const attendance: IAttendance[] = await Attendance.find(filter)
      .populate('employee', 'name email position department currentStatus')
      .sort({ timestamp: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        attendance,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          count: attendance.length,
          totalRecords: total,
        },
      },
    });
  } catch (error: any) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const punchInOut = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId, action, notes } = req.body;
    const ipAddress = req.ip;

    // Validate input
    if (!employeeId || !action) {
      res.status(400).json({
        success: false,
        message: 'Employee ID and action are required',
      });
      return;
    }

    if (!['punch_in', 'punch_out'].includes(action)) {
      res.status(400).json({
        success: false,
        message: 'Action must be either punch_in or punch_out',
      });
      return;
    }

    // Find employee
    const employee: IEmployee | null = await Employee.findById(employeeId);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Validate action based on current status
    if (action === 'punch_in' && employee.currentStatus === 'checked_in') {
      res.status(400).json({
        success: false,
        message: 'Employee is already checked in',
      });
      return;
    }

    if (action === 'punch_out' && employee.currentStatus === 'checked_out') {
      res.status(400).json({
        success: false,
        message: 'Employee is already checked out',
      });
      return;
    }

    // Create attendance record
    const attendanceRecord: IAttendance = new Attendance({
      employee: employeeId,
      action,
      timestamp: new Date(),
      ipAddress,
      notes,
    });

    await attendanceRecord.save();

    // Update employee status
    const updateData: any = {
      currentStatus: action === 'punch_in' ? 'checked_in' : 'checked_out',
    };

    if (action === 'punch_in') {
      updateData.lastPunchIn = new Date();
    } else {
      updateData.lastPunchOut = new Date();
    }

    await Employee.findByIdAndUpdate(employeeId, updateData);

    // Populate the attendance record for response
    const populatedRecord = await Attendance.findById(attendanceRecord._id)
      .populate('employee', 'name email position department currentStatus');

    // Emit real-time event (will be handled by socket)
    const io = req.app.get('io');
    if (io) {
      // Broadcast attendance update to all connected clients
      io.emit('attendance_update', {
        type: 'punch_update',
        data: populatedRecord,
      });

      // Also broadcast updated attendance stats
      const updatedStats = await getAttendanceStatsData();
      io.emit('attendance_stats_update', {
        type: 'stats_update',
        data: updatedStats,
      });

      console.log(`📡 Broadcasting attendance update: ${employee.name} ${action}`);
    }

    res.status(201).json({
      success: true,
      message: `Employee ${action.replace('_', ' ')} successful`,
      data: { attendance: populatedRecord },
    });
  } catch (error: any) {
    console.error('Punch in/out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getEmployeeAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) {
        dateFilter.timestamp.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setDate(end.getDate() + 1);
        dateFilter.timestamp.$lt = end;
      }
    }

    const attendance: IAttendance[] = await Attendance.find({
      employee: employeeId,
      ...dateFilter,
    })
      .populate('employee', 'name email position department')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        attendance,
        count: attendance.length,
      },
    });
  } catch (error: any) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getTodaysAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const attendance: IAttendance[] = await Attendance.find({
      timestamp: { $gte: startOfDay, $lt: endOfDay },
    })
      .populate('employee', 'name email position department currentStatus')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        attendance,
        count: attendance.length,
        date: startOfDay.toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getAttendanceStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await getAttendanceStatsData();
    
    console.log(`📊 Attendance Stats - Total: ${stats.totalEmployees}, Present: ${stats.presentEmployees}, Currently In: ${stats.currentlyCheckedIn}, Percentage: ${stats.attendancePercentage}%`);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getMyAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
      return;
    }

    // Find the employee record for this user by email
    const employee = await Employee.findOne({ email: req.user?.email });
    
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Get attendance records for this employee
    const attendance: IAttendance[] = await Attendance.find({
      employee: employee._id,
    })
      .populate('employee', 'name email position department')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      data: {
        attendance,
        count: attendance.length,
      },
    });
  } catch (error: any) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}; 