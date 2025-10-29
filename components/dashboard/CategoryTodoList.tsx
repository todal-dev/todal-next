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
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-8">
        <div className="text-center text-[#9CA3AF]">
          <p className="text-sm">할일이 없습니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB]">
      {/* Header */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full" 
            style={{ backgroundColor: categoryColor }}
          ></div>
          <h3 className="text-lg font-semibold text-[#111827]">{categoryName}</h3>
          <span className="text-sm text-[#9CA3AF]">
            {todos.filter(t => t.completed).length}/{todos.length} 완료
          </span>
        </div>
      </div>

      {/* Todo List by Date */}
      <div className="divide-y divide-[#F5F5F5]">
        {sortedDates.map((dateKey) => {
          const dateTodos = todosByDate[dateKey];
          const date = new Date(dateKey);
          const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;

          return (
            <div key={dateKey} className="p-6">
              {/* Date Header */}
              <div className="flex items-center gap-2 mb-4">
                <h4 className={`text-sm font-medium ${isToday ? 'text-[#2D9F6B]' : 'text-[#4B5563]'}`}>
                  {format(date, 'M월 d일 (EEE)', { locale: ko })}
                </h4>
                {isToday && (
                  <span className="px-2 py-0.5 bg-[#E8F5EE] text-[#1F7A51] text-xs font-medium rounded-full">
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
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        todo.completed 
                          ? 'bg-[#FAFAFA]' 
                          : 'hover:bg-[#FAFAFA]'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="flex-shrink-0">
                        {todo.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[#2D9F6B]" />
                        ) : (
                          <Circle className="w-5 h-5 text-[#E5E7EB]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${
                          todo.completed 
                            ? 'line-through text-[#9CA3AF]' 
                            : 'text-[#111827]'
                        }`}>
                          {todo.text}
                        </p>
                        {(todo.startTime || todo.endTime) && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-[#9CA3AF]">
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

