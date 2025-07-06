'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface EmployeePerformanceData {
  employeeName: string;
  employeePosition: string;
  employeeDepartment: string;
  completedTasks: number;
  totalRevenue: number;
  avgRevenuePerTask: number;
}

interface AttendancePerformanceData {
  name: string;
  position: string;
  department: string;
  currentStatus: string;
  totalPunchIns: number;
  recentAttendance: number;
}

interface DepartmentPerformanceData {
  department: string;
  completedTasks: number;
  totalRevenue: number;
  employeeCount: number;
  avgTasksPerEmployee: number;
  avgRevenuePerEmployee: number;
}

interface EmployeeChartProps {
  topPerformers?: EmployeePerformanceData[];
  attendanceLeaders?: AttendancePerformanceData[];
  departmentPerformance?: DepartmentPerformanceData[];
  type: 'performers' | 'attendance' | 'departments';
  height?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb'];

const EmployeeChart: React.FC<EmployeeChartProps> = ({ 
  topPerformers, 
  attendanceLeaders, 
  departmentPerformance, 
  type, 
  height = 300 
}) => {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">
                {entry.name.includes('Revenue') || entry.name.includes('Avg Revenue')
                  ? formatCurrency(entry.value) 
                  : entry.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (type === 'performers' && topPerformers) {
    const formattedData = topPerformers.slice(0, 8).map(performer => ({
      name: performer.employeeName.length > 15 
        ? performer.employeeName.substring(0, 15) + '...' 
        : performer.employeeName,
      fullName: performer.employeeName,
      position: performer.employeePosition,
      tasks: performer.completedTasks,
      revenue: performer.totalRevenue,
      avgRevenue: Math.round(performer.avgRevenuePerTask || 0)
    }));

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={11}
              tick={{ fill: '#666' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              yAxisId="tasks"
              stroke="#8884d8"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
              stroke="#82ca9d"
              fontSize={12}
              tick={{ fill: '#666' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="tasks"
              dataKey="tasks" 
              fill="#8884d8" 
              name="Completed Tasks"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="revenue"
              dataKey="revenue" 
              fill="#82ca9d" 
              name="Total Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'attendance' && attendanceLeaders) {
    const formattedData = attendanceLeaders.slice(0, 8).map(leader => ({
      name: leader.name.length > 15 
        ? leader.name.substring(0, 15) + '...' 
        : leader.name,
      fullName: leader.name,
      position: leader.position,
      totalPunchIns: leader.totalPunchIns,
      recentAttendance: leader.recentAttendance,
      status: leader.currentStatus
    }));

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              stroke="#666"
              fontSize={11}
              tick={{ fill: '#666' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="totalPunchIns" 
              fill="#3b82f6" 
              name="Total Check-ins"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="recentAttendance" 
              fill="#10b981" 
              name="Recent Attendance (30 days)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'departments' && departmentPerformance) {
    const formattedData = departmentPerformance.map(dept => ({
      department: dept.department || 'Unknown',
      completedTasks: dept.completedTasks,
      totalRevenue: dept.totalRevenue,
      employeeCount: dept.employeeCount,
      avgTasks: Math.round(dept.avgTasksPerEmployee || 0),
      avgRevenue: Math.round(dept.avgRevenuePerEmployee || 0)
    }));

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={formattedData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="department" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              yAxisId="count"
              stroke="#8884d8"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="right"
              stroke="#82ca9d"
              fontSize={12}
              tick={{ fill: '#666' }}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="count"
              dataKey="completedTasks" 
              fill="#8884d8" 
              name="Completed Tasks"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="revenue"
              dataKey="totalRevenue" 
              fill="#82ca9d" 
              name="Total Revenue"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="count"
              dataKey="employeeCount" 
              fill="#ffc658" 
              name="Employee Count"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <div>No data available</div>;
};

export default EmployeeChart; 