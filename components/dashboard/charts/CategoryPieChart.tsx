'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface CategoryPieChartProps {
  data: DashboardStats['categoryStats'];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  if (data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">🎯 카테고리별 시간 분석</h3>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">🦦</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">오늘은 여유롭게~</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">시간이 기록된 일정이 아직 없어요</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-1">🎯 카테고리별 시간 분석</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">이번 주 · 총 {totalHours.toFixed(1)}시간</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }: any) => `${name} ${percentage.toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="hours"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
            formatter={(value: any) => `${value.toFixed(1)}시간`}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-gray-900 dark:text-gray-50">{item.name}</span>
            </div>
            <span className="text-gray-600 dark:text-gray-400 font-medium">{item.hours.toFixed(1)}h ({item.percentage.toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

