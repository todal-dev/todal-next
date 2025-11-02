'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Todo } from '@/types/calendar';

interface CategoryTimelineProps {
  todos: Todo[];
  categoryColor: string;
}

export function CategoryTimeline({ todos, categoryColor }: CategoryTimelineProps) {
  // 시간에서 초 제거하는 헬퍼 함수
  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  // 시간이 있는 할일만 필터링하고 그룹화 (useMemo로 최적화)
  const timelineData = useMemo(() => {
    const timedTodos = todos.filter(t => t.startTime && t.endTime);

    if (timedTodos.length === 0) {
      return null;
    }

    // 시간대별로 그룹화 (시작 시간 기준)
    const todosByHour = timedTodos.reduce((acc, todo) => {
      if (!todo.startTime) return acc;
      const hour = parseInt(todo.startTime.split(':')[0]);
      if (!acc[hour]) {
        acc[hour] = [];
      }
      acc[hour].push(todo);
      return acc;
    }, {} as Record<number, Todo[]>);

    // 시간대 정렬
    const sortedHours = Object.keys(todosByHour)
      .map(Number)
      .sort((a, b) => a - b);

    // 최소/최대 시간
    const minHour = Math.min(...sortedHours);
    const maxHour = Math.max(...sortedHours);

    // 표시할 시간 범위 (최소 8시간)
    const displayMinHour = Math.max(0, minHour - 1);
    const displayMaxHour = Math.min(23, Math.max(maxHour + 1, displayMinHour + 8));

    return { todosByHour, displayMinHour, displayMaxHour, timedTodosCount: timedTodos.length };
  }, [todos]);

  if (!timelineData) {
    return (
      <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-8 transition-colors">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="text-6xl mb-4">🦦</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">시간을 정해볼까요?</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">시간이 지정된 할일이 없어요</p>
        </div>
      </div>
    );
  }

  const { todosByHour, displayMinHour, displayMaxHour, timedTodosCount } = timelineData;

  return (
    <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <h3 className="text-h3 text-gray-900 dark:text-gray-50">⏰ 시간대별 타임라인</h3>
        <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">
          {timedTodosCount}개의 일정
        </p>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>

          {/* Hours */}
          <div className="space-y-6">
            {Array.from({ length: displayMaxHour - displayMinHour + 1 }, (_, i) => {
              const hour = displayMinHour + i;
              const hourTodos = todosByHour[hour] || [];

              return (
                <div key={hour} className="relative">
                  {/* Time Label */}
                  <div className="flex items-start gap-6">
                    <div className="w-12 flex-shrink-0 text-right">
                      <span className="text-body-small font-medium text-gray-600 dark:text-gray-400">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>

                    {/* Todos */}
                    <div className="flex-1 space-y-2 pb-2">
                      {hourTodos.length > 0 ? (
                        hourTodos
                          .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                          .map((todo, index) => {
                            const [startHour, startMin] = (todo.startTime || '0:0').split(':').map(Number);
                            const [endHour, endMin] = (todo.endTime || '0:0').split(':').map(Number);
                            const duration = ((endHour * 60 + endMin) - (startHour * 60 + startMin)) / 60;

                            return (
                              <motion.div
                                key={todo.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative"
                              >
                                {/* Dot */}
                                <div 
                                  className="absolute -left-[30px] top-2 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                                  style={{ backgroundColor: categoryColor }}
                                ></div>

                                {/* Todo Card */}
                                <div 
                                  className={`p-3 rounded-lg border-l-4 transition-all ${
                                    todo.completed ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 'bg-warm-white dark:bg-dark-ocean-card'
                                  }`}
                                  style={{ 
                                    borderLeftColor: categoryColor,
                                    borderWidth: '0 0 0 4px',
                                    borderStyle: 'solid',
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {todo.completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-primary dark:text-primary-100" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-body-small font-medium ${
                                        todo.completed 
                                          ? 'line-through text-gray-400 dark:text-gray-500' 
                                          : 'text-gray-900 dark:text-gray-50'
                                      }`}>
                                        {todo.text}
                                      </p>
                                      <p className="text-caption text-gray-400 dark:text-gray-500 mt-1">
                                        {todo.startTime ? formatTime(todo.startTime) : ''} - {todo.endTime ? formatTime(todo.endTime) : ''} ({duration.toFixed(1)}h)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })
                      ) : (
                        <div className="h-6"></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

