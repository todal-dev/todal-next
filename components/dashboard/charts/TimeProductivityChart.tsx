'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface TimeProductivityChartProps {
  data: DashboardStats['timeProductivity'];
}

export function TimeProductivityChart({ data }: TimeProductivityChartProps) {
  const bestTimeSlot = data.reduce((max, d) => d.completionRate > max.completionRate ? d : max, data[0]);
  const filteredData = data.filter(d => d.count > 0);

  if (filteredData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">⏱️ 시간대별 생산성</h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🦦</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">데이터를 모으는 중이에요</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">시간이 기록된 일정이 아직 없어요</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">⏱️ 시간대별 생산성</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          🌟 최고 시간대: {bestTimeSlot.label}-{bestTimeSlot.hour + 2}:00 
          {bestTimeSlot.completionRate > 0 && ` (완료율 ${bestTimeSlot.completionRate.toFixed(0)}%)`}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={filteredData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            className="stroke-gray-200 dark:stroke-gray-600"
          />
          <XAxis 
            dataKey="label" 
            className="fill-gray-600 dark:fill-gray-400"
            tick={{ fontSize: 11 }}
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
              if (name === 'completionRate') return [`${value.toFixed(1)}%`, '완료율'];
              return [value, name];
            }}
          />
          <Bar dataKey="completionRate" fill="#8b5cf6" radius={[12, 12, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-4 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg border border-primary-100 dark:border-primary-800 transition-colors">
        <p className="text-sm text-gray-800 dark:text-gray-100 flex items-start gap-2">
          <span className="text-lg">💡</span>
          <span><strong className="text-primary-700 dark:text-primary-300">Tip:</strong> 중요한 일은 가장 생산적인 시간대에 배치해보세요!</span>
        </p>
      </div>
    </motion.div>
  );
}

