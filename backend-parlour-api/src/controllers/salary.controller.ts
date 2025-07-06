import { Request, Response } from 'express';
import Employee from '../models/Employee';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const getSalaryHistory = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required' });
    }

    console.log(`Fetching salary history for employee: ${employeeId}`);
    
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      console.log(`Employee not found with ID: ${employeeId}`);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Sort salary history by date in descending order
    const sortedHistory = [...(employee.salaryHistory || [])].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate pending salary if any
    const currentMonth = format(new Date(), 'yyyy-MM');
    const hasPendingSalary = !sortedHistory.some(record => record.month === currentMonth);
    
    let pendingSalary = null;
    if (hasPendingSalary && employee.salary && employee.salary > 0) {
      pendingSalary = {
        amount: employee.salary,
        date: new Date(),
        month: currentMonth,
        status: 'pending' as const
      };
    }

    const response = {
      success: true,
      data: {
        employee: {
          name: employee.name,
          position: employee.position,
          salary: employee.salary || 0
        },
        pendingSalary,
        salaryHistory: sortedHistory
      }
    };

    console.log(`Successfully fetched salary history for employee: ${employeeId}`);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching salary history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const paySalary = async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({ 
        success: false,
        message: 'Employee ID is required' 
      });
    }

    console.log(`Processing salary payment for employee: ${employeeId}`);
    
    const employee = await Employee.findById(employeeId);

    if (!employee) {
      console.log(`Employee not found with ID: ${employeeId}`);
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    if (!employee.salary || employee.salary <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid salary amount' 
      });
    }

    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Check if salary for current month is already paid
    const alreadyPaid = employee.salaryHistory.some(record => 
      record.month === currentMonth && record.status === 'paid'
    );

    if (alreadyPaid) {
      console.log(`Salary already paid for employee ${employeeId} in month ${currentMonth}`);
      return res.status(400).json({ 
        success: false,
        message: 'Salary for current month already paid' 
      });
    }

    // Add new salary record
    const newSalaryRecord = {
      amount: employee.salary,
      date: new Date(),
      month: currentMonth,
      status: 'paid' as const
    };

    employee.salaryHistory.push(newSalaryRecord);
    await employee.save();

    console.log(`Successfully processed salary payment for employee: ${employeeId}`);
    res.status(200).json({
      success: true,
      message: 'Salary paid successfully',
      data: {
        salaryRecord: newSalaryRecord
      }
    });
  } catch (error) {
    console.error('Error paying salary:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getSalaryStats = async (req: Request, res: Response) => {
  try {
    const currentMonth = format(new Date(), 'yyyy-MM');
    
    // Get all employees
    const employees = await Employee.find({});
    
    // Calculate total salary given this month
    let totalSalaryGiven = 0;
    let employeesPaid = 0;
    
    employees.forEach(employee => {
      const paidThisMonth = employee.salaryHistory.find(record => 
        record.month === currentMonth && record.status === 'paid'
      );
      
      if (paidThisMonth) {
        totalSalaryGiven += paidThisMonth.amount;
        employeesPaid++;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalSalaryGiven,
        employeesPaid,
        totalEmployees: employees.length,
        currentMonth
      }
    });
  } catch (error) {
    console.error('Error fetching salary stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 