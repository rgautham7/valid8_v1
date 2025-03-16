import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subMonths, addMonths, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DeviceUsagePieChartProps {
  data: {
    date: string;
    usage: number;
  }[];
}

const DeviceUsagePieChart: React.FC<DeviceUsagePieChartProps> = ({ data }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const getMonthUsageData = () => {
    const currentMonthData = data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startOfMonth(selectedDate) && itemDate <= endOfMonth(selectedDate);
    });

    const daysUsed = currentMonthData.filter(item => item.usage > 0).length;
    const daysInMonth = endOfMonth(selectedDate).getDate();
    const daysMissed = daysInMonth - daysUsed;

    return [
      { name: 'Days Used', value: daysUsed },
      { name: 'Days Missed', value: daysMissed }
    ];
  };

  const COLORS = ['#10B981', '#FCA5A5'];

  const handlePrevMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    if (isBefore(nextMonth, addMonths(new Date(), 1))) {
      setSelectedDate(nextMonth);
    }
  };

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];
  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2024, i, 1), 'MMMM')
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Monthly Device Usage</h3>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="text-sm font-medium rounded hover:bg-gray-100"
            >
              {format(selectedDate, 'MMMM')}
            </button>
            {showMonthPicker && (
              <div className="absolute z-10 p-2 mt-1 bg-white rounded-lg shadow-lg top-full">
                {months.map(month => (
                  <button
                    key={month}
                    onClick={() => {
                      setSelectedDate(new Date(selectedDate.getFullYear(), months.indexOf(month)));
                      setShowMonthPicker(false);
                    }}
                    className="block w-full px-2 py-1 text-left rounded hover:bg-gray-100"
                  >
                    {month}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowYearPicker(!showYearPicker)}
              className="text-sm font-medium rounded hover:bg-gray-100"
            >
              {selectedDate.getFullYear()}
            </button>
            {showYearPicker && (
              <div className="absolute z-10 p-2 mt-1 bg-white rounded-lg shadow-lg top-full">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedDate(new Date(year, selectedDate.getMonth()));
                      setShowYearPicker(false);
                    }}
                    className="block w-full px-2 py-1 text-left rounded hover:bg-gray-100"
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleNextMonth} className="p-1 rounded hover:bg-gray-100">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <PieChart>
          <Pie
            data={getMonthUsageData()}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {getMonthUsageData().map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center mt-4 space-x-4">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-500 rounded-full"></div>
          <span className="text-sm">Days Used</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-red-300 rounded-full"></div>
          <span className="text-sm">Days Missed</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceUsagePieChart;