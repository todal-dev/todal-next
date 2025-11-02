'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Todo } from '@/types/calendar';

interface TodaySummaryProps {
  todos: Todo[];
  categoryColor: string;
}

export function TodaySummary({ todos, categoryColor }: TodaySummaryProps) {
  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  const todayData = useMemo(() => {
    const today = new Date();
    const todayKey = format(today, 'yyyy-MM-dd');
    
    // 오늘 날짜의 할일만 필터링
    const todayTodos = todos.filter(todo => {
      const todoDate = format(todo.date, 'yyyy-MM-dd');
      return todoDate === todayKey;
    });

    // 완료된 할일과 미완료 할일 분리
    const completedTodos = todayTodos.filter(t => t.completed);
    const pendingTodos = todayTodos.filter(t => !t.completed);

    // 시간이 있는 할일과 없는 할일 분리
    const timedTodos = pendingTodos.filter(t => t.startTime && t.endTime);
    const untimedTodos = pendingTodos.filter(t => !t.startTime || !t.endTime);

    // 완료율 계산
    const completionRate = todayTodos.length > 0 
      ? Math.round((completedTodos.length / todayTodos.length) * 100) 
      : 0;

    // 시간이 있는 할일을 시간순으로 정렬
    const sortedTimedTodos = [...timedTodos].sort((a, b) => {
      if (!a.startTime || !b.startTime) return 0;
      return a.startTime.localeCompare(b.startTime);
    });

    return {
      total: todayTodos.length,
      completed: completedTodos.length,
      pending: pendingTodos.length,
      timed: sortedTimedTodos,
      untimed: untimedTodos,
      completionRate,
    };
  }, [todos]);

  if (todayData.total === 0) {
    return (
      <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
        <div className="p-6 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-h3 text-gray-900 dark:text-gray-50">📅 오늘의 할일</h3>
          <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">
            {format(new Date(), 'M월 d일 (EEE)', { locale: ko })}
          </p>
        </div>
        <div className="flex flex-col items-center justify-center text-center py-12 px-6">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">오늘은 할일이 없어요!</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">새로운 할일을 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-h3 text-gray-900 dark:text-gray-50">📅 오늘의 할일</h3>
            <p className="text-body-small text-gray-400 dark:text-gray-500 mt-1">
              {format(new Date(), 'M월 d일 (EEE)', { locale: ko })}
            </p>
          </div>
          {/* Completion Rate Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800">
            <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="text-body-small font-medium text-gray-900 dark:text-gray-50">
              {todayData.completionRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-6 pt-4 pb-2">
        <div className="relative h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${todayData.completionRate}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ backgroundColor: categoryColor }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-caption text-gray-400 dark:text-gray-500">
          <span>{todayData.completed}개 완료</span>
          <span>{todayData.pending}개 남음</span>
        </div>
      </div>

      {/* Today's Todos */}
      <div className="p-6 space-y-6">
        {/* 시간이 있는 할일 */}
        {todayData.timed.length > 0 && (
          <div>
            <h4 className="text-body-small font-medium text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              시간이 정해진 할일 ({todayData.timed.length})
            </h4>
            <div className="space-y-2">
              {todayData.timed.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    todo.completed
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary dark:text-primary-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-body-small ${
                        todo.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-900 dark:text-gray-50'
                      }`}
                    >
                      {todo.text}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-caption text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {todo.startTime ? formatTime(todo.startTime) : ''} -{' '}
                        {todo.endTime ? formatTime(todo.endTime) : ''}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 시간이 없는 할일 */}
        {todayData.untimed.length > 0 && (
          <div>
            <h4 className="text-body-small font-medium text-gray-600 dark:text-gray-400 mb-3">
              일반 할일 ({todayData.untimed.length})
            </h4>
            <div className="space-y-2">
              {todayData.untimed.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (todayData.timed.length + index) * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    todo.completed
                      ? 'bg-gray-50 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {todo.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary dark:text-primary-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    )}
                  </div>
                  <p
                    className={`text-body-small flex-1 ${
                      todo.completed
                        ? 'line-through text-gray-400 dark:text-gray-500'
                        : 'text-gray-900 dark:text-gray-50'
                    }`}
                  >
                    {todo.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todayData.pending === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-body font-medium text-gray-900 dark:text-gray-50 mb-1">
              모든 할일을 완료했어요!
            </p>
            <p className="text-body-small text-gray-400 dark:text-gray-500">
              오늘 하루도 수고하셨어요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}