'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: Date;
  categoryId: string;
  subtasks?: Todo[];
  parentId?: string;
  startTime?: string;
  endTime?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface BigCalendarProps {
  selectedDate?: Date;
  todos?: Todo[];
  categories?: Category[];
  onUpdateTodoTime?: (id: string, startTime?: string, endTime?: string) => void;
}

export function BigCalendar({ selectedDate = new Date(), todos = [], categories = [], onUpdateTodoTime }: BigCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const weekDays = getWeekDays(currentWeekStart);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const monthName = currentWeekStart.toLocaleString('ko-KR', { month: 'long' });
  const year = currentWeekStart.getFullYear();

  // 주간 할일 필터링 및 그룹화
  const weekTodos = useMemo(() => {
    const grouped: Record<string, Todo[]> = {};

    weekDays.forEach((day) => {
      const dateKey = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      grouped[dateKey] = todos.filter(todo => {
        const todoDateKey = `${todo.date.getFullYear()}-${String(todo.date.getMonth() + 1).padStart(2, '0')}-${String(todo.date.getDate()).padStart(2, '0')}`;
        return todoDateKey === dateKey && todo.startTime && todo.endTime;
      });
    });

    return grouped;
  }, [todos, weekDays]);

  // 시간을 분 단위로 변환
  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 할일 블록 위치 계산 (시간당 64px)
  const getTodoBlockStyle = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / 60) * 64; // 64px per hour
    const height = (duration / 60) * 64;

    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-gray-300">
        <h2 className="text-heading-2 text-neutral-text-primary">
          {year}년 {monthName}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handlePrevWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="이전 주"
          >
            <ChevronLeft size={20} className="text-neutral-text-secondary" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-2 hover:bg-neutral-gray-100 rounded-md transition-colors cursor-pointer"
            aria-label="다음 주"
          >
            <ChevronRight size={20} className="text-neutral-text-secondary" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="flex border-b border-neutral-gray-300">
        <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300" />
        {weekDays.map((date, index) => {
          const isToday = 
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={index}
              className={`flex-1 text-center py-3 border-r border-neutral-gray-300 ${
                isToday ? 'bg-primary-50' : ''
              }`}
            >
              <div className="text-xs text-neutral-text-secondary font-medium">
                {dayNames[date.getDay()]}
              </div>
              <div className={`text-lg font-semibold ${isToday ? 'text-primary-500' : 'text-neutral-text-primary'}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-w-full">
          {/* Time Column */}
          <div className="w-16 bg-neutral-gray-50 border-r border-neutral-gray-300 shrink-0 sticky left-0 z-10">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-16 border-b border-neutral-gray-200 text-xs text-neutral-text-secondary pt-1 text-center font-medium bg-neutral-gray-50"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex flex-1">
            {weekDays.map((date, dayIndex) => {
              const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
              const dayTodos = weekTodos[dateKey] || [];

              return (
                <div key={dayIndex} className="flex-1 border-r border-neutral-gray-300 min-w-[100px] relative">
                  {/* Time Grid Background */}
                  {hours.map((hour) => (
                    <div
                      key={`${dayIndex}-${hour}`}
                      className="h-16 border-b border-neutral-gray-200 hover:bg-neutral-gray-50 transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('bg-primary-100');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('bg-primary-100');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('bg-primary-100');

                        try {
                          const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                          const todoId = data.id;

                          // 드롭된 시간 계산
                          const rect = e.currentTarget.getBoundingClientRect();
                          const y = e.clientY - rect.top;
                          const minuteOffset = Math.round((y / 64) * 60);
                          const totalMinutes = hour * 60 + minuteOffset;

                          const startHour = Math.floor(totalMinutes / 60);
                          const startMinute = totalMinutes % 60;
                          const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

                          // 기본 1시간 지속
                          const endTotalMinutes = totalMinutes + 60;
                          const endHour = Math.floor(endTotalMinutes / 60);
                          const endMinute = endTotalMinutes % 60;
                          const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

                          onUpdateTodoTime?.(todoId, startTime, endTime);
                        } catch (error) {
                          console.error('드롭 처리 중 오류:', error);
                        }
                      }}
                    />
                  ))}

                  {/* Todo Blocks */}
                  {dayTodos.map((todo) => {
                    const category = categories.find(c => c.id === todo.categoryId);
                    const style = getTodoBlockStyle(todo.startTime!, todo.endTime!);

                    return (
                      <div
                        key={todo.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', JSON.stringify({
                            id: todo.id,
                            text: todo.text,
                            categoryId: todo.categoryId,
                            date: todo.date.toISOString(),
                          }));
                        }}
                        className="absolute left-0 right-0 mx-1 px-2 py-1 rounded text-xs overflow-hidden cursor-move hover:opacity-90 transition-opacity"
                        style={{
                          ...style,
                          backgroundColor: category?.color || '#3B82F6',
                          color: 'white',
                          zIndex: 1,
                        }}
                        title={`${todo.text} (${todo.startTime} - ${todo.endTime})`}
                      >
                        <div className="font-semibold truncate">{todo.text}</div>
                        <div className="text-xs opacity-90">{todo.startTime} - {todo.endTime}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
