'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RevenueData {
  period: string;
  revenue: number;
  tasks: number;
  avgRevenue?: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  height?: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data, height = 300 }) => {
  const formatCurrency = (value: number) => `₹${value.toLocaleString()}`;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-green-600">
            Revenue: <span className="font-bold">{formatCurrency(payload[0].value)}</span>
          </p>
          <p className="text-blue-600">
            Tasks: <span className="font-bold">{payload[1].value}</span>
          </p>
          {payload[2] && (
            <p className="text-purple-600">
              Avg Revenue: <span className="font-bold">{formatCurrency(payload[2].value)}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            stroke="#666"
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <YAxis 
            yAxisId="revenue"
            stroke="#10b981"
            fontSize={12}
            tick={{ fill: '#666' }}
            tickFormatter={formatCurrency}
          />
          <YAxis 
            yAxisId="tasks"
            orientation="right"
            stroke="#3b82f6"
            fontSize={12}
            tick={{ fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            name="Revenue (₹)"
          />
          <Line
            yAxisId="tasks"
            type="monotone"
            dataKey="tasks"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
            name="Tasks Completed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart; 