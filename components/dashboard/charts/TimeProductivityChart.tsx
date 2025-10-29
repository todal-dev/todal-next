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
        className="bg-white rounded-lg border border-neutral-gray-300 p-5"
      >
        <h3 className="text-lg font-semibold text-neutral-text-primary mb-4">⏱️ 시간대별 생산성</h3>
        <div className="flex items-center justify-center h-64 text-neutral-text-secondary">
          시간이 기록된 일정이 없습니다
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-lg border border-neutral-gray-300 p-5"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-text-primary mb-1">⏱️ 시간대별 생산성</h3>
        <p className="text-sm text-neutral-text-secondary">
          🌟 최고 시간대: {bestTimeSlot.label}-{bestTimeSlot.hour + 2}:00 
          {bestTimeSlot.completionRate > 0 && ` (완료율 ${bestTimeSlot.completionRate.toFixed(0)}%)`}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="label" 
            tick={{ fill: '#6b7280', fontSize: 11 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: any, name: string) => {
              if (name === 'completionRate') return [`${value.toFixed(1)}%`, '완료율'];
              return [value, name];
            }}
          />
          <Bar dataKey="completionRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-900">
          💡 <strong>추천:</strong> 중요한 일은 가장 생산적인 시간대에 배치해보세요!
        </p>
      </div>
    </motion.div>
  );
}

