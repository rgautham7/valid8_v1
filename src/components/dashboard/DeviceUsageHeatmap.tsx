import React, { useState } from 'react';
import { format, subMonths, addMonths, isBefore, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface DeviceUsageHeatmapProps {
  data: {
    date: string;
    count: number;
    devices?: string[];
  }[];
  title: string;
  showDeviceInfo?: boolean;
}

const DeviceUsageHeatmap: React.FC<DeviceUsageHeatmapProps> = ({ 
  data, 
  title,
  showDeviceInfo = false
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1];
  const months = Array.from({ length: 12 }, (_, i) => 
    format(new Date(2024, i, 1), 'MMMM')
  );

  const handlePrevMonth = () => {
    setSelectedDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(selectedDate, 1);
    if (isBefore(nextMonth, addMonths(new Date(), 1))) {
      setSelectedDate(nextMonth);
    }
  };

  const filteredData = data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startOfMonth(selectedDate) && itemDate <= endOfMonth(selectedDate);
  });

  const daysInMonth = Array.from(
    { length: endOfMonth(selectedDate).getDate() },
    (_, i) => i + 1
  );

  const daysUsed = filteredData.filter(item => item.count > 0).length;
  const totalDays = daysInMonth.length;
  const daysMissed = totalDays - daysUsed;

  // Get device info for a specific day
  const getDeviceInfo = (day: number) => {
    const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    const dayData = data.find(d => d.date === formattedDate);
    
    if (dayData?.devices && dayData.devices.length > 0) {
      return `Devices used: ${dayData.devices.join(', ')}`;
    }
    
    return 'No devices used on this day';
  };

  // Get color based on number of devices used
  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-gray-100';
    if (count === 1) return 'bg-green-200';
    if (count === 2) return 'bg-green-300';
    if (count === 3) return 'bg-green-400';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between mb-4">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-1 rounded hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
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
              className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-100"
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
      
      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-xs font-medium text-center text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the 1st of the month */}
        {Array.from({ length: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square"></div>
        ))}
        
        {/* Days of the month */}
        {daysInMonth.map(day => {
          const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
          const formattedDate = format(currentDate, 'yyyy-MM-dd');
          const dayData = filteredData.find(d => d.date === formattedDate);
          const usage = dayData?.count || 0;
          
          return (
            <TooltipProvider key={day}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`aspect-square rounded p-1 text-xs flex items-center justify-center ${
                      getColorClass(usage)
                    } ${
                      usage > 0 ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
                    }`}
                  >
                    {day}
                    {usage > 0 && showDeviceInfo && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{format(currentDate, 'MMMM d, yyyy')}</p>
                  {showDeviceInfo && dayData?.devices && (
                    <div className="mt-1">
                      <p className="text-xs font-medium">Devices used:</p>
                      <ul className="pl-3 text-xs">
                        {dayData.devices.map((deviceId, idx) => (
                          <li key={idx} className="text-gray-200">{deviceId}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {showDeviceInfo && !dayData?.devices && (
                    <p className="text-xs text-gray-500">No devices used on this day</p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center mt-4 space-x-2 space-y-2 sm:space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-gray-100 rounded"></div>
          <span className="text-xs">No usage</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-200 rounded"></div>
          <span className="text-xs">1 device</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-300 rounded"></div>
          <span className="text-xs">2 devices</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-400 rounded"></div>
          <span className="text-xs">3 devices</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-500 rounded"></div>
          <span className="text-xs">4+ devices</span>
        </div>
      </div>
      
      {/* Summary */}
      <div className="flex items-center justify-center mt-4 space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-green-400 rounded"></div>
          <span className="text-xs">Days Used: {daysUsed}</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 mr-2 bg-gray-100 rounded"></div>
          <span className="text-xs">Days Missed: {daysMissed}</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceUsageHeatmap;