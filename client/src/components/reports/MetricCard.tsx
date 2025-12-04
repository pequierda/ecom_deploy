// components/reports/MetricCard.tsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number | null;
  icon: LucideIcon;
  iconColor: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change = null,
  icon: Icon,
  iconColor,
  prefix = '',
  suffix = '',
  description,
  loading = false
}) => {
  const getTrendStyle = (change: number | null) => {
    if (change === null) return { icon: TrendingUp, color: 'text-gray-500', text: 'N/A' };
    if (change > 0) return { 
      icon: TrendingUp, 
      color: 'text-green-600', 
      text: `+${change}%` 
    };
    if (change < 0) return { 
      icon: TrendingDown, 
      color: 'text-red-600', 
      text: `${change}%` 
    };
    return { icon: TrendingUp, color: 'text-gray-500', text: '0%' };
  };

  const trendStyle = getTrendStyle(change);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          
          {change !== undefined && (
            <div className="flex items-center">
              <trendStyle.icon className={`w-4 h-4 mr-1 ${trendStyle.color}`} />
              <span className={`text-sm font-medium ${trendStyle.color}`}>
                {trendStyle.text}
              </span>
              <span className="text-sm text-gray-500 ml-1">from last period</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className="p-3 bg-gray-50 rounded-lg">
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;