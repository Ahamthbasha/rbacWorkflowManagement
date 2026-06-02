// components/dashboard/StatCard.tsx
import {type LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBgColor: string;   // e.g. 'bg-blue-100 dark:bg-blue-900/30'
  iconColor: string;     // e.g. 'text-blue-600 dark:text-blue-400'
}

const StatCard = ({ label, value, icon: Icon, iconBgColor, iconColor }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`${iconBgColor} p-3 rounded-lg`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
    </div>
  </div>
);

export default StatCard;