'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface SalaryRangeData {
  range: string;
  count: number;
  totalSalary: number;
}

interface DepartmentSalaryData {
  department: string;
  employeeCount: number;
  totalSalary: number;
  avgSalary: number;
}

interface SalaryChartProps {
  salaryRanges: SalaryRangeData[];
  departmentSalaries: DepartmentSalaryData[];
  type: 'ranges' | 'departments';
  height?: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const SalaryChart: React.FC<SalaryChartProps> = ({ salaryRanges, departmentSalaries, type, height = 300 }) => {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">
                {entry.name.includes('Salary') || entry.name.includes('Revenue') 
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

  if (type === 'ranges') {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={salaryRanges}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="range" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="count" 
              fill="#8884d8" 
              name="Employee Count"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={departmentSalaries}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
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
            yAxisId="salary"
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
            dataKey="employeeCount" 
            fill="#8884d8" 
            name="Employee Count"
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            yAxisId="salary"
            dataKey="avgSalary" 
            fill="#82ca9d" 
            name="Average Salary"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalaryChart; 