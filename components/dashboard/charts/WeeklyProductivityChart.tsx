'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface WeeklyProductivityChartProps {
  data: DashboardStats['weeklyProductivity'];
}

export function WeeklyProductivityChart({ data }: WeeklyProductivityChartProps) {
  const avgPercentage = data.reduce((sum, d) => sum + d.percentage, 0) / data.length;
  const bestDay = data.reduce((max, d) => d.percentage > max.percentage ? d : max, data[0]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">📊 주간 생산성</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          평균 완료율: {avgPercentage.toFixed(0)}% · 최고: {bestDay.day} ({bestDay.percentage.toFixed(0)}%)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-600"
          />
          <XAxis 
            dataKey="day" 
            className="fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            strokeOpacity={0.2}
          />
          <YAxis 
            className="fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 12 }}
            stroke="currentColor"
            strokeOpacity={0.2}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-neutral-white)',
              border: '1px solid var(--color-neutral-gray-200)',
              borderRadius: '12px',
              padding: '10px 14px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            wrapperClassName="dark:[&_.recharts-tooltip-wrapper]:![color-scheme:dark]"
            cursor={{ fill: 'rgba(45, 159, 107, 0.1)' }}
            formatter={(value: any, name: string) => {
              if (name === 'percentage') return [`${value.toFixed(1)}%`, '완료율'];
              return [value, name];
            }}
          />
          <Bar dataKey="percentage" radius={[12, 12, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.percentage >= 70 ? '#10b981' : entry.percentage >= 50 ? '#3b82f6' : '#f59e0b'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
          <span>70% 이상</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
          <span>50-69%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500 shadow-sm"></div>
          <span>50% 미만</span>
        </div>
      </div>
    </motion.div>
  );
}

