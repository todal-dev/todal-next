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
      className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 p-4 sm:p-5 hover:shadow-md dark:hover:shadow-gray-900/30 transition-all touch-manipulation"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-body-small font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-50 mb-1 truncate">{value}</h3>
          {subtitle && (
            <p className="text-body-small text-gray-400 dark:text-gray-500 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-caption font-medium ${trend.isPositive ? 'text-status-success dark:text-green-400' : 'text-status-error dark:text-red-400'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-caption text-gray-400 dark:text-gray-500">vs 이전</span>
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

