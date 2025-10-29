'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import type { Todo } from '@/types/calendar';

interface CategoryTimelineProps {
  todos: Todo[];
  categoryColor: string;
}

export function CategoryTimeline({ todos, categoryColor }: CategoryTimelineProps) {
  // 시간이 있는 할일만 필터링
  const timedTodos = todos.filter(t => t.startTime && t.endTime);

  if (timedTodos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E5E7EB] p-8">
        <div className="text-center text-[#9CA3AF]">
          <p className="text-sm">시간이 지정된 할일이 없습니다</p>
        </div>
      </div>
    );
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

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB]">
      {/* Header */}
      <div className="p-6 border-b border-[#E5E7EB]">
        <h3 className="text-lg font-semibold text-[#111827]">시간대별 타임라인</h3>
        <p className="text-sm text-[#9CA3AF] mt-1">
          {timedTodos.length}개의 일정
        </p>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-[#E5E7EB]"></div>

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
                      <span className="text-sm font-medium text-[#4B5563]">
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
                                  className="absolute -left-[30px] top-2 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                  style={{ backgroundColor: categoryColor }}
                                ></div>

                                {/* Todo Card */}
                                <div 
                                  className={`p-3 rounded-lg border-l-4 ${
                                    todo.completed ? 'bg-[#FAFAFA] opacity-60' : 'bg-white'
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
                                        <CheckCircle2 className="w-4 h-4 text-[#2D9F6B]" />
                                      ) : (
                                        <Circle className="w-4 h-4 text-[#E5E7EB]" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${
                                        todo.completed 
                                          ? 'line-through text-[#9CA3AF]' 
                                          : 'text-[#111827]'
                                      }`}>
                                        {todo.text}
                                      </p>
                                      <p className="text-xs text-[#9CA3AF] mt-1">
                                        {todo.startTime} - {todo.endTime} ({duration.toFixed(1)}h)
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

