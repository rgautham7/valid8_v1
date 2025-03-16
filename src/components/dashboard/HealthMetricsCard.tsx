import React from 'react';

interface HealthMetricsCardProps {
  title: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: React.ReactNode;
}

const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
  switch (status) {
    case 'normal':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({
  title,
  value,
  unit,
  status,
  icon,
}) => {
  const statusColor = getStatusColor(status);

  return (
    <div className={`rounded-lg border p-4 ${statusColor}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-3">{icon}</div>
          <div>
            <h3 className="text-sm font-medium">{title}</h3>
            <div className="flex items-baseline mt-1">
              <p className="text-2xl font-semibold">{value}</p>
              <p className="ml-1 text-sm">{unit}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};