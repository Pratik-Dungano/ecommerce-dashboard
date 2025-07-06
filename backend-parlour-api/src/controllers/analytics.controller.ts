import { Request, Response } from 'express';
import Task, { ITask } from '../models/Task';
import Employee, { IEmployee } from '../models/Employee';
import Attendance, { IAttendance } from '../models/Attendance';

// Get revenue trends over time
export const getRevenueTrends = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'month' } = req.query;
    
    let groupBy;
    let dateFormat;
    
    if (period === 'week') {
      groupBy = {
        year: { $year: '$completedAt' },
        week: { $week: '$completedAt' }
      };
      dateFormat = 'week';
    } else if (period === 'day') {
      groupBy = {
        year: { $year: '$completedAt' },
        month: { $month: '$completedAt' },
        day: { $dayOfMonth: '$completedAt' }
      };
      dateFormat = 'day';
    } else {
      groupBy = {
        year: { $year: '$completedAt' },
        month: { $month: '$completedAt' }
      };
      dateFormat = 'month';
    }

    const revenueTrends = await Task.aggregate([
      {
        $match: {
          status: 'completed',
          price: { $exists: true, $ne: null, $gt: 0 },
          completedAt: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$price' },
          taskCount: { $sum: 1 },
          avgRevenue: { $avg: '$price' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);

    // Format the data for frontend consumption
    const formattedData = revenueTrends.map(item => {
      let label;
      if (dateFormat === 'week') {
        label = `Week ${item._id.week}, ${item._id.year}`;
      } else if (dateFormat === 'day') {
        label = `${item._id.day}/${item._id.month}/${item._id.year}`;
      } else {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }
      
      return {
        period: label,
        revenue: item.totalRevenue,
        tasks: item.taskCount,
        avgRevenue: Math.round(item.avgRevenue * 100) / 100
      };
    });

    res.status(200).json({
      success: true,
      data: {
        trends: formattedData,
        period: dateFormat
      }
    });
  } catch (error: any) {
    console.error('Get revenue trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get salary distribution data
export const getSalaryDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const employees = await Employee.find({ isActive: true });
    
    const salaryRanges = [
      { range: '0-20k', min: 0, max: 20000, count: 0, totalSalary: 0 },
      { range: '20k-40k', min: 20000, max: 40000, count: 0, totalSalary: 0 },
      { range: '40k-60k', min: 40000, max: 60000, count: 0, totalSalary: 0 },
      { range: '60k-80k', min: 60000, max: 80000, count: 0, totalSalary: 0 },
      { range: '80k+', min: 80000, max: Infinity, count: 0, totalSalary: 0 }
    ];

    const departmentSalaries: { [key: string]: { count: number, totalSalary: number } } = {};
    let totalSalaryPaid = 0;

    employees.forEach(employee => {
      const currentSalary = employee.salary || 0;
      
      // Salary range distribution
      const range = salaryRanges.find(r => currentSalary >= r.min && currentSalary < r.max);
      if (range) {
        range.count++;
        range.totalSalary += currentSalary;
      }

      // Department-wise salary
      const dept = employee.department || 'Unknown';
      if (!departmentSalaries[dept]) {
        departmentSalaries[dept] = { count: 0, totalSalary: 0 };
      }
      departmentSalaries[dept].count++;
      departmentSalaries[dept].totalSalary += currentSalary;

      // Calculate total salary paid from salary history
      if (employee.salaryHistory && employee.salaryHistory.length > 0) {
        const totalPaid = employee.salaryHistory.reduce((sum, record) => sum + record.amount, 0);
        totalSalaryPaid += totalPaid;
      }
    });

    const departmentData = Object.entries(departmentSalaries).map(([dept, data]) => ({
      department: dept,
      employeeCount: data.count,
      totalSalary: data.totalSalary,
      avgSalary: Math.round(data.totalSalary / data.count)
    }));

    res.status(200).json({
      success: true,
      data: {
        salaryRanges: salaryRanges.filter(r => r.count > 0),
        departmentSalaries: departmentData,
        totalSalaryPaid,
        totalEmployees: employees.length
      }
    });
  } catch (error: any) {
    console.error('Get salary distribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get task analytics
export const getTaskAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Task status distribution
    const taskStatusStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$price', 0] } }
        }
      }
    ]);

    // Task priority distribution
    const taskPriorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Tasks by category/type (based on title keywords)
    const taskCategories = await Task.aggregate([
      {
        $project: {
          category: {
            $switch: {
              branches: [
                { case: { $regexMatch: { input: '$title', regex: /hair|styling|cut|color/i } }, then: 'Hair Services' },
                { case: { $regexMatch: { input: '$title', regex: /makeup|facial|beauty/i } }, then: 'Beauty Services' },
                { case: { $regexMatch: { input: '$title', regex: /manicure|pedicure|nail/i } }, then: 'Nail Services' },
                { case: { $regexMatch: { input: '$title', regex: /massage|spa|treatment/i } }, then: 'Spa Services' },
                { case: { $regexMatch: { input: '$title', regex: /eyebrow|threading/i } }, then: 'Eyebrow Services' }
              ],
              default: 'Other Services'
            }
          },
          status: 1,
          price: 1
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, { $ifNull: ['$price', 0] }, 0] } }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    // Monthly task completion trends
    const completionTrends = await Task.aggregate([
      {
        $match: {
          status: 'completed',
          completedAt: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$completedAt' },
            month: { $month: '$completedAt' }
          },
          completed: { $sum: 1 },
          revenue: { $sum: { $ifNull: ['$price', 0] } }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedCompletionTrends = completionTrends.map(item => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        completed: item.completed,
        revenue: item.revenue
      };
    });

    res.status(200).json({
      success: true,
      data: {
        statusDistribution: taskStatusStats,
        priorityDistribution: taskPriorityStats,
        categoryAnalysis: taskCategories,
        completionTrends: formattedCompletionTrends
      }
    });
  } catch (error: any) {
    console.error('Get task analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get employee performance analytics
export const getEmployeePerformance = async (req: Request, res: Response): Promise<void> => {
  try {
    // Task completion by employee
    const employeeTaskStats = await Task.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$assignedTo',
          completedTasks: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$price', 0] } }
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          employeeName: '$employee.name',
          employeePosition: '$employee.position',
          employeeDepartment: '$employee.department',
          completedTasks: 1,
          totalRevenue: 1,
          avgRevenuePerTask: { $divide: ['$totalRevenue', '$completedTasks'] }
        }
      },
      {
        $sort: { completedTasks: -1 }
      }
    ]);

    // Attendance performance
    const attendanceStats = await Employee.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $lookup: {
          from: 'attendances',
          localField: '_id',
          foreignField: 'employee',
          as: 'attendanceRecords'
        }
      },
      {
        $project: {
          name: 1,
          position: 1,
          department: 1,
          currentStatus: 1,
          totalPunchIns: {
            $size: {
              $filter: {
                input: '$attendanceRecords',
                cond: { $eq: ['$$this.action', 'punch_in'] }
              }
            }
          },
          recentAttendance: {
            $size: {
              $filter: {
                input: '$attendanceRecords',
                cond: {
                  $and: [
                    { $eq: ['$$this.action', 'punch_in'] },
                    { $gte: ['$$this.timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }
                  ]
                }
              }
            }
          }
        }
      },
      {
        $sort: { recentAttendance: -1 }
      }
    ]);

    // Department performance
    const departmentPerformance = await Task.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $group: {
          _id: '$employee.department',
          completedTasks: { $sum: 1 },
          totalRevenue: { $sum: { $ifNull: ['$price', 0] } },
          employeeCount: { $addToSet: '$employee._id' }
        }
      },
      {
        $project: {
          department: '$_id',
          completedTasks: 1,
          totalRevenue: 1,
          employeeCount: { $size: '$employeeCount' },
          avgTasksPerEmployee: { $divide: ['$completedTasks', { $size: '$employeeCount' }] },
          avgRevenuePerEmployee: { $divide: ['$totalRevenue', { $size: '$employeeCount' }] }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topPerformers: employeeTaskStats.slice(0, 10),
        attendanceLeaders: attendanceStats.slice(0, 10),
        departmentPerformance,
        totalEmployees: attendanceStats.length
      }
    });
  } catch (error: any) {
    console.error('Get employee performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get comprehensive dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      revenueTrends,
      salaryDistribution,
      taskAnalytics,
      employeePerformance
    ] = await Promise.all([
      getRevenueTrendsData(),
      getSalaryDistributionData(),
      getTaskAnalyticsData(),
      getEmployeePerformanceData()
    ]);

    res.status(200).json({
      success: true,
      data: {
        revenueTrends,
        salaryDistribution,
        taskAnalytics,
        employeePerformance
      }
    });
  } catch (error: any) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions to get data without HTTP response
const getRevenueTrendsData = async () => {
  const revenueTrends = await Task.aggregate([
    {
      $match: {
        status: 'completed',
        price: { $exists: true, $ne: null, $gt: 0 },
        completedAt: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$completedAt' },
          month: { $month: '$completedAt' }
        },
        totalRevenue: { $sum: '$price' },
        taskCount: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  return revenueTrends.map(item => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      period: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: item.totalRevenue,
      tasks: item.taskCount
    };
  });
};

const getSalaryDistributionData = async () => {
  const employees = await Employee.find({ isActive: true });
  let totalSalaryPaid = 0;

  employees.forEach(employee => {
    if (employee.salaryHistory && employee.salaryHistory.length > 0) {
      const totalPaid = employee.salaryHistory.reduce((sum, record) => sum + record.amount, 0);
      totalSalaryPaid += totalPaid;
    }
  });

  return { totalSalaryPaid, totalEmployees: employees.length };
};

const getTaskAnalyticsData = async () => {
  const taskStatusStats = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  return { statusDistribution: taskStatusStats };
};

const getEmployeePerformanceData = async () => {
  const employeeTaskStats = await Task.aggregate([
    {
      $match: {
        status: 'completed'
      }
    },
    {
      $group: {
        _id: '$assignedTo',
        completedTasks: { $sum: 1 },
        totalRevenue: { $sum: { $ifNull: ['$price', 0] } }
      }
    },
    {
      $lookup: {
        from: 'employees',
        localField: '_id',
        foreignField: '_id',
        as: 'employee'
      }
    },
    {
      $unwind: '$employee'
    },
    {
      $project: {
        employeeName: '$employee.name',
        completedTasks: 1,
        totalRevenue: 1
      }
    },
    {
      $sort: { completedTasks: -1 }
    }
  ]);

  return { topPerformers: employeeTaskStats.slice(0, 5) };
}; 