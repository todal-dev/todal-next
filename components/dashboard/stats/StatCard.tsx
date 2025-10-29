import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({ title, value, subtitle, icon: Icon, iconColor, iconBgColor, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-neutral-gray-300 p-4 sm:p-5 hover:shadow-md transition-shadow touch-manipulation"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-neutral-text-secondary mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-neutral-text-primary mb-1 truncate">{value}</h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-neutral-text-secondary truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-neutral-text-secondary">vs 이전</span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-2.5 sm:p-3 flex-shrink-0 ${iconBgColor}`}>
          <Icon size={20} className={`sm:w-6 sm:h-6 ${iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}

