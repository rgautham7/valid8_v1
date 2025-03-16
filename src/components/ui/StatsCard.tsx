interface StatsCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export default function StatsCard({ title, value, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-red-600">{value}</p>
    </div>
  );
}