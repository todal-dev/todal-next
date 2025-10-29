'use client';

import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import type { Todo } from '@/types/calendar';

interface CategoryAnalyticsProps {
  todos: Todo[];
  categoryColor: string;
}

export function CategoryAnalytics({ todos, categoryColor }: CategoryAnalyticsProps) {
  // 통계 계산
  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  // 총 시간 계산
  const totalHours = todos.reduce((sum, todo) => {
    if (todo.startTime && todo.endTime) {
      const [startHour, startMin] = todo.startTime.split(':').map(Number);
      const [endHour, endMin] = todo.endTime.split(':').map(Number);
      const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;
      return sum + duration;
    }
    return sum;
  }, 0);

  const completedHours = todos
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

  // 시간대별 생산성 (완료된 할일 수)
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 완료율 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 p-6 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-md flex items-center justify-center"
              style={{ backgroundColor: `${categoryColor}20` }}
            >
              <CheckCircle2 className="w-5 h-5" style={{ color: categoryColor }} />
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
          transition={{ delay: 0.1 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 p-6 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-md bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
          transition={{ delay: 0.2 }}
          className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 p-6 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-md bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
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
          className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 p-6 transition-colors"
        >
          <div className="mb-4">
            <h3 className="text-h3 text-gray-900 dark:text-gray-50">시간대별 생산성</h3>
            <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">완료된 할일 수</p>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'completed') return [`${value}개`, '완료'];
                  if (name === 'total') return [`${value}개`, '전체'];
                  return [value, name];
                }}
              />
              <Bar dataKey="completed" radius={[8, 8, 0, 0]}>
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

