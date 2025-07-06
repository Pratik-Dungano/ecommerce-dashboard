import { Request, Response } from 'express';
import Employee, { IEmployee } from '../models/Employee';
import PreviousStaff from '../models/PreviousStaff';
import User from '../models/User';
import { startOfDay } from 'date-fns';
import cron from 'node-cron';

export const getAllEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees: IEmployee[] = await Employee.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        employees,
        count: employees.length,
      },
    });
  } catch (error: any) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const getEmployeeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const employee: IEmployee | null = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { employee },
    });
  } catch (error: any) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const createEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, position, department, joinDate } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !position || !department) {
      res.status(400).json({
        success: false,
        message: 'Name, email, phone, position, and department are required',
      });
      return;
    }

    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      res.status(409).json({
        success: false,
        message: 'Employee already exists with this email',
      });
      return;
    }

    const newEmployee: IEmployee = new Employee({
      name,
      email,
      phone,
      position,
      department,
      joinDate: joinDate || new Date(),
    });

    await newEmployee.save();

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: { employee: newEmployee },
    });
  } catch (error: any) {
    console.error('Create employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const updateEmployee = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.currentStatus;
    delete updateData.lastPunchIn;
    delete updateData.lastPunchOut;

    const updatedEmployee: IEmployee | null = await Employee.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: { employee: updatedEmployee },
    });
  } catch (error: any) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Function to calculate total income from salary history
const calculateTotalIncome = (salaryHistory: any[]) => {
  const totalIncome = salaryHistory.reduce((total, record) => total + record.amount, 0);
  const paidIncome = salaryHistory
    .filter(record => record.status === 'paid')
    .reduce((total, record) => total + record.amount, 0);
  const pendingIncome = salaryHistory
    .filter(record => record.status === 'pending')
    .reduce((total, record) => total + record.amount, 0);
  
  return {
    totalIncome,
    paidIncome,
    pendingIncome
  };
};

// Function to move employee to previous staff
const moveToArchive = async (employee: any) => {
  try {
    console.log(`\n=== MOVING EMPLOYEE TO ARCHIVE ===`);
    console.log(`Employee: ${employee.name} (${employee.email})`);
    console.log(`Position: ${employee.position}`);
    console.log(`Department: ${employee.department}`);
    console.log(`isLeaving: ${employee.isLeaving}`);
    console.log(`leavingDate: ${employee.leavingDate}`);
    
    const incomeData = calculateTotalIncome(employee.salaryHistory);
    console.log(`Salary History: ${employee.salaryHistory ? employee.salaryHistory.length : 0} records`);
    console.log(`Income Data:`, incomeData);

    const previousStaffData = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position,
      department: employee.department,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
      emergencyContact: employee.emergencyContact,
      joinDate: employee.joinDate,
      leavingDate: employee.leavingDate || new Date(),
      totalIncome: incomeData.totalIncome,
      paidIncome: incomeData.paidIncome,
      pendingIncome: incomeData.pendingIncome,
      salaryHistory: employee.salaryHistory || [],
      lastPosition: employee.position,
      reasonForLeaving: 'Employee marked as leaving',
      performanceRating: undefined // Optional field
    };

    console.log(`\n--- CREATING PREVIOUSSTAFF RECORD ---`);
    console.log(`Data to save:`, {
      name: previousStaffData.name,
      email: previousStaffData.email,
      phone: previousStaffData.phone,
      position: previousStaffData.position,
      department: previousStaffData.department,
      totalIncome: previousStaffData.totalIncome,
      paidIncome: previousStaffData.paidIncome,
      pendingIncome: previousStaffData.pendingIncome,
      salaryHistoryCount: previousStaffData.salaryHistory.length,
      leavingDate: previousStaffData.leavingDate,
      reasonForLeaving: previousStaffData.reasonForLeaving
    });

    const previousStaffRecord = await PreviousStaff.create(previousStaffData);
    console.log(`✅ SUCCESS: PreviousStaff record created with ID: ${previousStaffRecord._id}`);
    console.log(`Record details:`, {
      id: previousStaffRecord._id,
      name: previousStaffRecord.name,
      email: previousStaffRecord.email,
      totalIncome: previousStaffRecord.totalIncome,
      createdAt: previousStaffRecord.createdAt
    });
    
    // Also delete from User collection using email
    console.log(`\n--- DELETING USER RECORD ---`);
    console.log(`Looking for user with email: ${employee.email}`);
    const userDeleted = await User.findOneAndDelete({ email: employee.email });
    console.log(`User record deleted: ${userDeleted ? 'YES' : 'NO (not found)'}`);
    
    console.log(`=== ARCHIVE PROCESS COMPLETED ===\n`);
    return previousStaffRecord;
  } catch (error: any) {
    console.error(`❌ ERROR moving employee ${employee.name} to archive:`, error);
    console.error(`Error details:`, error?.message || 'Unknown error');
    throw error;
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Move to archive before deletion
    await moveToArchive(employee);

    // Delete the employee
    await Employee.findByIdAndDelete(id);

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to clean up left employees
export const cleanupLeftEmployees = async () => {
  try {
    console.log('Running automatic cleanup for left employees...');
    
    // Find employees who are leaving - simplified to just check isLeaving: true
    const leftEmployees = await Employee.find({ isLeaving: true });

    console.log(`Found ${leftEmployees.length} employees with isLeaving: true to process`);

    if (leftEmployees.length === 0) {
      console.log('No employees found with isLeaving: true that need cleanup');
      return;
    }

    for (const employee of leftEmployees) {
      try {
        console.log(`Processing employee: ${employee.name} (${employee.email}) - isLeaving: ${employee.isLeaving}`);
        
        // Move to archive before deletion (this also deletes from User model)
        await moveToArchive(employee);
        
        // Delete the employee from Employee model
        await Employee.findByIdAndDelete(employee._id);
        
        console.log(`Successfully processed employee ${employee.name} - moved to archive and deleted from active records`);
      } catch (error) {
        console.error(`Error processing employee ${employee.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in automatic cleanup of left employees:', error);
  }
};

// Manual cleanup endpoint for immediate processing
export const manualCleanupLeftEmployees = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Manual cleanup requested...');
    
    // Find all employees who are leaving - simplified to just check isLeaving: true
    const leftEmployees = await Employee.find({ isLeaving: true });

    console.log(`Manual cleanup found ${leftEmployees.length} employees with isLeaving: true to process`);

    if (leftEmployees.length === 0) {
      res.status(200).json({
        success: true,
        message: 'No employees found with isLeaving: true that need to be cleaned up',
        data: { processedCount: 0 }
      });
      return;
    }

    const processedEmployees = [];

    for (const employee of leftEmployees) {
      try {
        console.log(`Manually processing employee: ${employee.name} (${employee.email}) - isLeaving: ${employee.isLeaving}`);
        
        // Calculate salary data
        const incomeData = calculateTotalIncome(employee.salaryHistory);
        
        // Move to archive (this now also deletes from User model)
        await moveToArchive(employee);
        
        // Delete from Employee model
        await Employee.findByIdAndDelete(employee._id);
        
        processedEmployees.push({
          name: employee.name,
          email: employee.email,
          leavingDate: employee.leavingDate,
          totalIncome: incomeData.totalIncome,
          paidIncome: incomeData.paidIncome,
          pendingIncome: incomeData.pendingIncome,
        });
        
        console.log(`Successfully processed employee ${employee.name} - moved to archive and deleted from active records`);
      } catch (error) {
        console.error(`Error processing employee ${employee.name}:`, error);
      }
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${processedEmployees.length} left employees`,
      data: {
        processedCount: processedEmployees.length,
        processedEmployees: processedEmployees
      }
    });
  } catch (error: any) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during cleanup',
    });
  }
};

// Enhanced cleanup that runs once a day at 12 AM with better error handling
let cleanupRunning = false;

const runPeriodicCleanup = async () => {
  if (cleanupRunning) {
    console.log('Cleanup already running, skipping this cycle');
    return;
  }
  
  cleanupRunning = true;
  try {
    console.log('🕛 Starting scheduled daily cleanup at 12 AM...');
    await cleanupLeftEmployees();
    console.log('✅ Daily cleanup completed successfully');
  } catch (error) {
    console.error('❌ Error in daily cleanup:', error);
  } finally {
    cleanupRunning = false;
  }
};

// Schedule cleanup to run every day at 12:00 AM (midnight)
console.log('⏰ Setting up automatic cleanup to run daily at 12:00 AM...');
cron.schedule('0 0 * * *', runPeriodicCleanup, {
  timezone: "Asia/Kolkata" // Adjust timezone as needed
});

// Also run cleanup once on startup after a short delay (for testing)
setTimeout(() => {
  console.log('🚀 Running initial cleanup on startup...');
  runPeriodicCleanup();
}, 5000);

// Update employee salary
export const updateEmployeeSalary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { salary } = req.body;

    // Validate salary
    if (typeof salary !== 'number' || salary < 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid salary amount',
      });
      return;
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    employee.salary = salary;
    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Salary updated successfully',
      data: { employee },
    });
  } catch (error: any) {
    console.error('Update salary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Function to move employee to previous staff and delete from both models
export const moveEmployeeToPreviousStaff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reasonForLeaving, performanceRating } = req.body;

    // Find the employee
    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    // Check if employee is marked as leaving
    if (!employee.isLeaving) {
      res.status(400).json({
        success: false,
        message: 'Employee is not marked as leaving. Please mark employee as leaving first.',
      });
      return;
    }

    // Calculate total income from salary history
    const incomeData = calculateTotalIncome(employee.salaryHistory);

    // Create PreviousStaff record
    const previousStaffData = {
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      address: employee.address,
      dateOfBirth: employee.dateOfBirth,
      emergencyContact: employee.emergencyContact,
      joinDate: employee.joinDate,
      leavingDate: employee.leavingDate || new Date(),
      totalIncome: incomeData.totalIncome,
      paidIncome: incomeData.paidIncome,
      pendingIncome: incomeData.pendingIncome,
      salaryHistory: employee.salaryHistory,
      lastPosition: employee.position,
      reasonForLeaving: reasonForLeaving,
      performanceRating: performanceRating,
    };

    // Save to PreviousStaff collection
    await PreviousStaff.create(previousStaffData);

    // Find and delete from User collection using email
    const userDeleted = await User.findOneAndDelete({ email: employee.email });

    // Delete from Employee collection
    await Employee.findByIdAndDelete(id);

    // Log the operation with detailed salary information
    console.log(`Employee ${employee.name} moved to PreviousStaff:
      - Total Income: $${incomeData.totalIncome}
      - Paid Income: $${incomeData.paidIncome}
      - Pending Income: $${incomeData.pendingIncome}
      - Deleted from User and Employee collections`);

    res.status(200).json({
      success: true,
      message: 'Employee successfully moved to previous staff and deleted from active records',
      data: {
        movedToPreviousStaff: true,
        userDeleted: !!userDeleted,
        employeeDeleted: true,
        salaryData: {
          totalIncome: incomeData.totalIncome,
          paidIncome: incomeData.paidIncome,
          pendingIncome: incomeData.pendingIncome,
        },
      },
    });
  } catch (error: any) {
    console.error('Move employee to previous staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Function to mark employee as leaving (for testing)
export const markEmployeeAsLeaving = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { leavingDate, reasonForLeaving } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
      return;
    }

    employee.isLeaving = true;
    employee.leavingDate = leavingDate ? new Date(leavingDate) : new Date();
    
    await employee.save();

    console.log(`Employee ${employee.name} marked as leaving on ${employee.leavingDate}`);

    res.status(200).json({
      success: true,
      message: 'Employee marked as leaving successfully',
      data: { 
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          isLeaving: employee.isLeaving,
          leavingDate: employee.leavingDate
        }
      },
    });
  } catch (error: any) {
    console.error('Mark employee as leaving error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}; 