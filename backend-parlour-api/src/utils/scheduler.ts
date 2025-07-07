import cron from 'node-cron';
import Employee from '../models/Employee';
import Attendance from '../models/Attendance';

interface DailyAttendance {
  punchIns: Date[];
  punchOuts: Date[];
  totalHours: number;
  totalSessions: number;
}

// Calculate total hours between punch ins and punch outs
const calculateTotalHours = (punchIns: Date[], punchOuts: Date[]): number => {
  let totalMilliseconds = 0;
  const pairs = Math.min(punchIns.length, punchOuts.length);
  
  for (let i = 0; i < pairs; i++) {
    totalMilliseconds += punchOuts[i].getTime() - punchIns[i].getTime();
  }
  
  return Math.round((totalMilliseconds / (1000 * 60 * 60)) * 100) / 100; // Convert to hours with 2 decimal places
};

// Save daily attendance logs to employee profiles at 10 PM
export const scheduleDailyAttendanceBackup = () => {
  cron.schedule('0 22 * * *', async () => { // Runs at 10:00 PM every day
    try {
      console.log('Starting daily attendance backup...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all attendance records for today
      const attendanceRecords = await Attendance.find({
        timestamp: {
          $gte: today,
          $lt: tomorrow
        }
      }).sort({ timestamp: 1 });

      // Group attendance records by employee
      const employeeAttendance = new Map<string, DailyAttendance>();
      
      attendanceRecords.forEach(record => {
        const employeeId = record.employee.toString();
        if (!employeeAttendance.has(employeeId)) {
          employeeAttendance.set(employeeId, {
            punchIns: [],
            punchOuts: [],
            totalHours: 0,
            totalSessions: 0
          });
        }
        
        const logs = employeeAttendance.get(employeeId)!;
        if (record.action === 'punch_in') {
          logs.punchIns.push(record.timestamp);
        } else {
          logs.punchOuts.push(record.timestamp);
        }
      });

      // Process and store attendance for each employee
      for (const [employeeId, logs] of employeeAttendance.entries()) {
        // Sort timestamps to ensure chronological order
        logs.punchIns.sort((a, b) => a.getTime() - b.getTime());
        logs.punchOuts.sort((a, b) => a.getTime() - b.getTime());
        
        // Calculate totals
        logs.totalHours = calculateTotalHours(logs.punchIns, logs.punchOuts);
        logs.totalSessions = Math.min(logs.punchIns.length, logs.punchOuts.length);

        // Store in employee profile
        await Employee.findByIdAndUpdate(
          employeeId,
          {
            $push: {
              attendanceHistory: {
                date: today,
                punchIns: logs.punchIns,
                punchOuts: logs.punchOuts,
                totalHours: logs.totalHours,
                totalSessions: logs.totalSessions
              }
            }
          }
        );

        console.log(`Backed up attendance for employee ${employeeId}: ${logs.totalSessions} sessions, ${logs.totalHours} hours`);
      }
      
      console.log('Daily attendance backup completed successfully');
    } catch (error) {
      console.error('Error in daily attendance backup:', error);
    }
  }, {
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
};

// Clear attendance logs at 12 PM
export const scheduleAttendanceCleanup = () => {
  cron.schedule('0 12 * * *', async () => { // Runs at 12:00 PM every day
    try {
      console.log('Starting attendance cleanup...');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      // Delete all attendance records from before yesterday
      await Attendance.deleteMany({
        timestamp: { $lt: yesterday }
      });
      
      console.log('Attendance cleanup completed successfully');
    } catch (error) {
      console.error('Error in attendance cleanup:', error);
    }
  }, {
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
};

// Delete all attendance logs at 12 AM (for admin dashboard)
export const scheduleAdminAttendanceCleanup = () => {
  cron.schedule('0 0 * * *', async () => { // Runs at 12:00 AM every day
    try {
      console.log('Starting admin attendance cleanup (12 AM)...');
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Today 12:00 AM
      // Delete all attendance records before today
      const result = await Attendance.deleteMany({
        timestamp: { $lt: today }
      });
      console.log(`Admin attendance cleanup completed. Deleted ${result.deletedCount} records.`);
    } catch (error) {
      console.error('Error in admin attendance cleanup:', error);
    }
  }, {
    timezone: "Asia/Kolkata" // Adjust timezone as needed
  });
};

// Initialize all schedulers
export const initializeSchedulers = () => {
  scheduleDailyAttendanceBackup();
  scheduleAttendanceCleanup();
  scheduleAdminAttendanceCleanup();
  console.log('Attendance schedulers initialized');
}; 