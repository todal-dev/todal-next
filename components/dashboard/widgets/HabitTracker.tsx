import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { format } from 'date-fns';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface HabitTrackerProps {
  habits: DashboardStats['habitStreaks'];
}

export function HabitTracker({ habits }: HabitTrackerProps) {
  if (habits.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-warm-white dark:bg-dark-ocean-card rounded-md border border-gray-200 dark:border-gray-600 transition-colors p-5"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">🔥 습관 트래커</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-600 dark:text-gray-400">
          <Flame size={48} className="mb-3 opacity-30" />
          <p className="text-sm">반복 일정이 없습니다</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors p-5"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">🔥 습관 트래커</h3>

      <div className="space-y-5">
        {habits.map((habit, index) => (
          <motion.div
            key={habit.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.6 + index * 0.05 }}
            className="border-b border-gray-200 dark:border-gray-600 last:border-0 pb-4 last:pb-0"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-gray-50 text-sm">{habit.title}</h4>
              {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 rounded-full">
                  <Flame size={14} className="text-orange-500" />
                  <span className="text-xs font-semibold text-orange-700">{habit.currentStreak}일 연속!</span>
                </div>
              )}
            </div>

            {/* Heatmap */}
            <div className="flex items-center gap-1 mb-2">
              {habit.heatmap.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-full h-6 rounded transition-all ${
                    day.completed 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  title={`${format(new Date(day.date), 'M월 d일')}: ${day.completed ? '완료' : '미완료'}`}
                />
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
              <span>완료율: {habit.completionRate.toFixed(0)}%</span>
              <span>총 {habit.totalCompletions}회 달성</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">완료</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-gray-600 dark:text-gray-400">미완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

