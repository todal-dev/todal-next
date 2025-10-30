'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Todo } from '@/types/calendar';

interface CategoryAnalyticsProps {
  todos: Todo[];
  categoryColor: string;
}

export function CategoryAnalytics({ todos, categoryColor }: CategoryAnalyticsProps) {
  // 통계 계산 (useMemo로 최적화)
  const { totalTodos, completedTodos, completionRate, totalHours, completedHours } = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const rate = total > 0 ? (completed / total) * 100 : 0;

    // 총 시간 계산
    const hours = todos.reduce((sum, todo) => {
      if (todo.startTime && todo.endTime) {
        const [startHour, startMin] = todo.startTime.split(':').map(Number);
        const [endHour, endMin] = todo.endTime.split(':').map(Number);
        const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
        return sum + duration;
      }
      return sum;
    }, 0);

    const completedHrs = todos
      .filter(t => t.completed)
      .reduce((sum, todo) => {
        if (todo.startTime && todo.endTime) {
          const [startHour, startMin] = todo.startTime.split(':').map(Number);
          const [endHour, endMin] = todo.endTime.split(':').map(Number);
          const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
          return sum + duration;
        }
        return sum;
      }, 0);

    return { 
      totalTodos: total, 
      completedTodos: completed, 
      completionRate: rate, 
      totalHours: hours, 
      completedHours: completedHrs 
    };
  }, [todos]);

  // 시간대별 생산성 (완료된 할일 수) - useMemo로 최적화
  const hourlyData = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const hourTodos = todos.filter(t => {
        if (!t.startTime) return false;
        const todoHour = parseInt(t.startTime.split(':')[0]);
        return todoHour === hour;
      });

      const completed = hourTodos.filter(t => t.completed).length;
      const total = hourTodos.length;

      return {
        hour,
        label: `${hour}h`,
        completed,
        total,
        rate: total > 0 ? (completed / total) * 100 : 0,
      };
    }).filter(d => d.total > 0); // 할일이 있는 시간대만
  }, [todos]);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 완료율 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <CheckCircle2 className="w-6 h-6" style={{ color: categoryColor }} />
            </div>
            <div>
              <p className="text-body-small text-gray-400 dark:text-gray-500">완료율</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{completionRate.toFixed(0)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-body-small text-gray-600 dark:text-gray-400">
            <span>{completedTodos}/{totalTodos} 완료</span>
          </div>
        </motion.div>

        {/* 총 시간 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center transition-transform hover:scale-110">
              <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-body-small text-gray-400 dark:text-gray-500">총 시간</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{totalHours.toFixed(1)}h</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-body-small text-gray-600 dark:text-gray-400">
            <span>완료 {completedHours.toFixed(1)}h</span>
          </div>
        </motion.div>

        {/* 평균 시간 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2, scale: 1.01 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center transition-transform hover:scale-110">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-body-small text-gray-400 dark:text-gray-500">평균 시간</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">
                {totalTodos > 0 ? (totalHours / totalTodos).toFixed(1) : 0}h
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-body-small text-gray-600 dark:text-gray-400">
            <span>할일당</span>
          </div>
        </motion.div>
      </div>

      {/* Hourly Chart */}
      {hourlyData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-6 transition-colors"
        >
          <div className="mb-4">
            <h3 className="text-h3 text-gray-900 dark:text-gray-50">⏰ 시간대별 생산성</h3>
            <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">완료된 할일 수</p>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                className="stroke-gray-200 dark:stroke-gray-600"
              />
              <XAxis 
                dataKey="label" 
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
                  if (name === 'completed') return [`${value}개`, '완료'];
                  if (name === 'total') return [`${value}개`, '전체'];
                  return [value, name];
                }}
              />
              <Bar dataKey="completed" radius={[12, 12, 0, 0]}>
                {hourlyData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-6 text-body-small">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: categoryColor }}
              ></div>
              <span className="text-gray-600 dark:text-gray-400">완료된 할일</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

