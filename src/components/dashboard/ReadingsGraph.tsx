import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ReadingsGraphProps {
  data: Array<{
    timestamp: string;
    value: number;
  }>;
  title: string;
  color: string;
  unit: string;
}

export const ReadingsGraph: React.FC<ReadingsGraphProps> = ({
  data,
  title,
  color,
  unit,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis unit={unit} />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleString()}
              formatter={(value: number) => [`${value}${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};