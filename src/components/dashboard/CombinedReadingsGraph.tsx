import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays, addDays, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Reading {
  timestamp: string;
  value: number;
}

interface CombinedReadingsGraphProps {
  bpData: Reading[];
  bgData: Reading[];
  title: string;
}

const CombinedReadingsGraph: React.FC<CombinedReadingsGraphProps> = ({ bpData, bgData }) => {
  const [startDate, setStartDate] = useState(new Date(bpData[bpData.length - 1].timestamp));
  const [endDate, setEndDate] = useState(new Date(bpData[0].timestamp));

  const handlePrevPeriod = () => {
    setStartDate(prevDate => subDays(prevDate, 7));
    setEndDate(prevDate => subDays(prevDate, 7));
  };

  const handleNextPeriod = () => {
    const newEndDate = addDays(endDate, 7);
    if (isBefore(newEndDate, new Date())) {
      setStartDate(prevDate => addDays(prevDate, 7));
      setEndDate(newEndDate);
    }
  };

  const filteredData = bpData
    .filter(reading => {
      const date = new Date(reading.timestamp);
      return date >= startDate && date <= endDate;
    })
    .map((bp, index) => ({
      timestamp: format(new Date(bp.timestamp), 'MMM dd'),
      bp: bp.value,
      bg: bgData[index]?.value
    }));

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Health Readings Trend</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevPeriod} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium">
            {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd')}
          </span>
          <button onClick={handleNextPeriod} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
          <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="bp" stroke="#3B82F6" name="Blood Pressure (mmHg)" />
          <Line yAxisId="right" type="monotone" dataKey="bg" stroke="#10B981" name="Blood Glucose (mg/dL)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CombinedReadingsGraph;