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
      className="bg-white rounded-lg border border-neutral-gray-300 p-5"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-neutral-text-primary mb-1">📊 주간 생산성</h3>
        <p className="text-sm text-neutral-text-secondary">
          평균 완료율: {avgPercentage.toFixed(0)}% · 최고: {bestDay.day} ({bestDay.percentage.toFixed(0)}%)
        </p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
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
              if (name === 'percentage') return [`${value.toFixed(1)}%`, '완료율'];
              return [value, name];
            }}
          />
          <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.percentage >= 70 ? '#10b981' : entry.percentage >= 50 ? '#3b82f6' : '#f59e0b'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-xs text-neutral-text-secondary">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>70% 이상</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>50-69%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>50% 미만</span>
        </div>
      </div>
    </motion.div>
  );
}

