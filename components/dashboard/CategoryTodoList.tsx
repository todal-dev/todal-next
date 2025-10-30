'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Todo } from '@/types/calendar';

interface CategoryTodoListProps {
  todos: Todo[];
  categoryName: string;
  categoryColor: string;
}

export function CategoryTodoList({ todos, categoryName, categoryColor }: CategoryTodoListProps) {
  // 날짜별로 그룹화
  const todosByDate = todos.reduce((acc, todo) => {
    const dateKey = format(todo.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(todo);
    return acc;
  }, {} as Record<string, Todo[]>);

  // 날짜 정렬
  const sortedDates = Object.keys(todosByDate).sort();

  if (todos.length === 0) {
    return (
      <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 p-8 transition-colors">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="text-6xl mb-4">🦦</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">모든 할일을 완료했어요!</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">새로운 할일을 추가해보세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full shadow-sm" 
            style={{ backgroundColor: categoryColor }}
          ></div>
          <h3 className="text-h3 text-gray-900 dark:text-gray-50">{categoryName}</h3>
          <span className="text-body-small text-gray-400 dark:text-gray-500">
            {todos.filter(t => t.completed).length}/{todos.length} 완료
          </span>
        </div>
      </div>

      {/* Todo List by Date */}
      <div className="divide-y divide-gray-100 dark:divide-gray-600">
        {sortedDates.map((dateKey) => {
          const dateTodos = todosByDate[dateKey];
          const date = new Date(dateKey);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

          return (
            <div key={dateKey} className="p-6">
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-4">
                <h4 className={`text-body-small font-medium ${isToday ? 'text-primary dark:text-primary-100' : 'text-gray-600 dark:text-gray-400'}`}>
                  {format(date, 'M월 d일 (EEE)', { locale: ko })}
                </h4>
                {isToday && (
                  <span className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-100 text-label rounded-full">
                    오늘
                  </span>
                )}
              </div>

              {/* Todos */}
              <div className="space-y-2">
                {dateTodos
                  .sort((a, b) => {
                    // 시간 있는 것 먼저, 그 다음 시간순
                    if (a.startTime && !b.startTime) return -1;
                    if (!a.startTime && b.startTime) return 1;
                    if (a.startTime && b.startTime) {
                      return a.startTime.localeCompare(b.startTime);
                    }
                    return 0;
                  })
                  .map((todo, index) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        todo.completed 
                          ? 'bg-gray-50 dark:bg-gray-800' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        {todo.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-primary dark:text-primary-100" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 dark:text-gray-600 hover:text-primary dark:hover:text-primary-400 transition-colors" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-body ${
                          todo.completed 
                            ? 'line-through text-gray-400 dark:text-gray-500' 
                            : 'text-gray-900 dark:text-gray-50'
                        }`}>
                          {todo.text}
                        </p>
                        {(todo.startTime || todo.endTime) && (
                          <div className="flex items-center gap-1 mt-1 text-caption text-gray-400 dark:text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {todo.startTime} {todo.endTime && `- ${todo.endTime}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

