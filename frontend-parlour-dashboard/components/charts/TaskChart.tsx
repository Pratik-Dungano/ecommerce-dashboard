'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TaskStatusData {
  _id: string;
  count: number;
  totalValue?: number;
}

interface TaskPriorityData {
  _id: string;
  count: number;
  completed: number;
}

interface TaskCategoryData {
  _id: string;
  total: number;
  completed: number;
  revenue: number;
}

interface TaskChartProps {
  statusData?: TaskStatusData[];
  priorityData?: TaskPriorityData[];
  categoryData?: TaskCategoryData[];
  type: 'status' | 'priority' | 'category';
  height?: number;
}

const STATUS_COLORS = {
  'assigned': '#fbbf24',
  'in_progress': '#3b82f6',
  'completed': '#10b981',
  'cancelled': '#ef4444'
};

const PRIORITY_COLORS = {
  'high': '#ef4444',
  'medium': '#fbbf24',
  'low': '#10b981'
};

const CATEGORY_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

const TaskChart: React.FC<TaskChartProps> = ({ statusData, priorityData, categoryData, type, height = 300 }) => {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 capitalize">{label || payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">
                {entry.name.includes('Revenue') 
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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (type === 'status' && statusData) {
    const formattedData = statusData.map(item => ({
      name: item._id.replace('_', ' ').toUpperCase(),
      value: item.count,
      color: STATUS_COLORS[item._id as keyof typeof STATUS_COLORS] || '#8884d8'
    }));

    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'priority' && priorityData) {
    const formattedData = priorityData.map(item => ({
      priority: item._id.toUpperCase(),
      total: item.count,
      completed: item.completed,
      pending: item.count - item.completed,
      completionRate: Math.round((item.completed / item.count) * 100)
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
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="priority" 
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
              dataKey="completed" 
              stackId="a"
              fill="#10b981" 
              name="Completed"
              radius={[0, 0, 0, 0]}
            />
            <Bar 
              dataKey="pending" 
              stackId="a"
              fill="#fbbf24" 
              name="Pending"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'category' && categoryData) {
    const formattedData = categoryData.map(item => ({
      category: item._id,
      total: item.total,
      completed: item.completed,
      revenue: item.revenue,
      completionRate: Math.round((item.completed / item.total) * 100)
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
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="category" 
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
              dataKey="total" 
              fill="#8884d8" 
              name="Total Tasks"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              yAxisId="revenue"
              dataKey="revenue" 
              fill="#82ca9d" 
              name="Revenue"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return <div>No data available</div>;
};

export default TaskChart; 