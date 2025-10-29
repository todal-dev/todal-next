import { useMemo } from 'react';
import { startOfWeek, endOfWeek, startOfDay, subDays, isSameDay, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Todo, Category } from '@/types/calendar';
import { generateRecurringEvents } from '@/utils/recurringUtils';
import { formatDateKey } from '@/utils/calendarUtils';

export interface DashboardStats {
  todayStats: {
    completed: number;
    total: number;
    percentage: number;
    trend: number; // 어제 대비 % 변화
  };
  weekStats: {
    completed: number;
    total: number;
    percentage: number;
    trend: number; // 지난주 대비 % 변화
  };
  totalTodos: {
    total: number;
    overdue: number;
    today: number;
    upcoming: number;
  };
  streak: {
    current: number;
    best: number;
  };
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: Date;
    startTime?: string;
    endTime?: string;
    category: {
      name: string;
      color: string;
    };
    priority: 'high' | 'medium' | 'low';
  }>;
  categoryStats: Array<{
    categoryId: string;
    name: string;
    color: string;
    hours: number;
    percentage: number;
  }>;
  weeklyProductivity: Array<{
    date: string;
    day: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  timeProductivity: Array<{
    hour: number;
    label: string;
    completionRate: number;
    count: number;
  }>;
  habitStreaks: Array<{
    id: string;
    title: string;
    currentStreak: number;
    totalCompletions: number;
    completionRate: number;
    heatmap: Array<{
      date: string;
      completed: boolean;
    }>;
  }>;
}

export function useDashboard(todos: Todo[], categories: Category[]): DashboardStats {
  return useMemo(() => {
    const today = startOfDay(new Date());
    const yesterday = subDays(today, 1);
    
    // 반복 일정 확장
    const allDates: Date[] = [];
    for (let i = -30; i <= 30; i++) {
      allDates.push(new Date(today.getTime() + i * 24 * 60 * 60 * 1000));
    }

    const expandedTodos: Todo[] = [...todos.filter(t => !t.recurrenceRule)];
    
    todos.filter(t => t.recurrenceRule).forEach((todo) => {
      const generatedEvents = generateRecurringEvents(todo, allDates);
      generatedEvents.forEach((event) => {
        const dateKey = formatDateKey(event.date);
        const isCompleted = todo.completedDates?.includes(dateKey) || false;
        expandedTodos.push({
          ...event,
          completed: isCompleted,
        });
      });
    });

    // 오늘 통계
    const todayTodos = expandedTodos.filter(t => isSameDay(t.date, today));
    const todayCompleted = todayTodos.filter(t => t.completed).length;
    const todayTotal = todayTodos.length;
    const todayPercentage = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;

    // 어제 통계 (트렌드 계산)
    const yesterdayTodos = expandedTodos.filter(t => isSameDay(t.date, yesterday));
    const yesterdayCompleted = yesterdayTodos.filter(t => t.completed).length;
    const yesterdayTotal = yesterdayTodos.length;
    const yesterdayPercentage = yesterdayTotal > 0 ? (yesterdayCompleted / yesterdayTotal) * 100 : 0;
    const todayTrend = yesterdayPercentage > 0 ? todayPercentage - yesterdayPercentage : 0;

    // 이번 주 통계
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekTodos = expandedTodos.filter(t => t.date >= weekStart && t.date <= weekEnd);
    const weekCompleted = weekTodos.filter(t => t.completed).length;
    const weekTotal = weekTodos.length;
    const weekPercentage = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0;

    // 지난주 통계
    const lastWeekStart = subDays(weekStart, 7);
    const lastWeekEnd = subDays(weekEnd, 7);
    const lastWeekTodos = expandedTodos.filter(t => t.date >= lastWeekStart && t.date <= lastWeekEnd);
    const lastWeekCompleted = lastWeekTodos.filter(t => t.completed).length;
    const lastWeekTotal = lastWeekTodos.length;
    const lastWeekPercentage = lastWeekTotal > 0 ? (lastWeekCompleted / lastWeekTotal) * 100 : 0;
    const weekTrend = lastWeekPercentage > 0 ? weekPercentage - lastWeekPercentage : 0;

    // 총 할일 (미완료)
    const incompleteTodos = expandedTodos.filter(t => !t.completed && t.date >= today);
    const overdueTodos = expandedTodos.filter(t => !t.completed && t.date < today);
    const upcomingTodos = incompleteTodos.filter(t => !isSameDay(t.date, today));

    // 연속 달성 일수 계산
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = subDays(today, i);
      const dayTodos = expandedTodos.filter(t => isSameDay(t.date, checkDate));
      
      if (dayTodos.length === 0) continue;
      
      const allCompleted = dayTodos.every(t => t.completed);
      
      if (allCompleted) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
      }
    }
    
    if (tempStreak > bestStreak) bestStreak = tempStreak;

    // 다가오는 일정 (오늘부터 7일 이내, 시간이 있는 것만)
    const categoryMap = new Map(categories.map(c => [c.id, c]));
    const upcomingEvents = expandedTodos
      .filter(t => !t.completed && t.date >= today && t.date <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000))
      .filter(t => t.startTime) // 시간이 있는 것만
      .sort((a, b) => {
        const dateCompare = a.date.getTime() - b.date.getTime();
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
      })
      .slice(0, 5)
      .map(t => {
        const category = categoryMap.get(t.categoryId) || { name: '미분류', color: '#gray' };
        const daysUntil = Math.ceil((t.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const priority = daysUntil === 0 ? 'high' : daysUntil <= 2 ? 'medium' : 'low';
        
        return {
          id: t.id,
          title: t.text,
          date: t.date,
          startTime: t.startTime,
          endTime: t.endTime,
          category: {
            name: category.name,
            color: category.color,
          },
          priority: priority as 'low' | 'medium' | 'high',
        };
      });

    // 카테고리별 시간 분석 (이번 주)
    const categoryMinutes = new Map<string, number>();
    weekTodos.forEach(t => {
      if (t.startTime && t.endTime) {
        const [startHour, startMin] = t.startTime.split(':').map(Number);
        const [endHour, endMin] = t.endTime.split(':').map(Number);
        const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);
        
        const current = categoryMinutes.get(t.categoryId) || 0;
        categoryMinutes.set(t.categoryId, current + duration);
      }
    });

    const totalMinutes = Array.from(categoryMinutes.values()).reduce((sum, m) => sum + m, 0);
    const categoryStats = Array.from(categoryMinutes.entries())
      .map(([categoryId, minutes]) => {
        const category = categoryMap.get(categoryId) || { name: '미분류', color: '#gray' };
        return {
          categoryId,
          name: category.name,
          color: category.color,
          hours: minutes / 60,
          percentage: totalMinutes > 0 ? (minutes / totalMinutes) * 100 : 0,
        };
      })
      .sort((a, b) => b.hours - a.hours);

    // 주간 생산성 차트 (최근 7일)
    const weeklyProductivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayTodos = expandedTodos.filter(t => isSameDay(t.date, date));
      const completed = dayTodos.filter(t => t.completed).length;
      const total = dayTodos.length;
      
      weeklyProductivity.push({
        date: format(date, 'yyyy-MM-dd'),
        day: format(date, 'EEE', { locale: ko }),
        completed,
        total,
        percentage: total > 0 ? (completed / total) * 100 : 0,
      });
    }

    // 시간대별 생산성 (2시간 단위)
    const timeSlots = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
    const timeProductivity = timeSlots.map(hour => {
      const slotTodos = expandedTodos.filter(t => {
        if (!t.startTime) return false;
        const todoHour = parseInt(t.startTime.split(':')[0]);
        return todoHour >= hour && todoHour < hour + 2;
      });

      const completed = slotTodos.filter(t => t.completed).length;
      const total = slotTodos.length;

      return {
        hour,
        label: `${hour}:00`,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        count: total,
      };
    });

    // 습관 트래커 (반복 일정만)
    const recurringTodos = todos.filter(t => t.recurrenceRule);
    const habitStreaks = recurringTodos.slice(0, 3).map(todo => {
      const heatmap = [];
      let streak = 0;
      let totalCompletions = 0;

      for (let i = 13; i >= 0; i--) {
        const date = subDays(today, i);
        const dateKey = formatDateKey(date);
        const completed = todo.completedDates?.includes(dateKey) || false;
        
        heatmap.push({
          date: format(date, 'yyyy-MM-dd'),
          completed,
        });

        if (completed) {
          totalCompletions++;
          if (i === 0 || streak > 0) streak++;
        } else {
          if (i > 0) streak = 0;
        }
      }

      return {
        id: todo.id,
        title: todo.text,
        currentStreak: streak,
        totalCompletions,
        completionRate: (totalCompletions / 14) * 100,
        heatmap,
      };
    });

    return {
      todayStats: {
        completed: todayCompleted,
        total: todayTotal,
        percentage: todayPercentage,
        trend: todayTrend,
      },
      weekStats: {
        completed: weekCompleted,
        total: weekTotal,
        percentage: weekPercentage,
        trend: weekTrend,
      },
      totalTodos: {
        total: incompleteTodos.length,
        overdue: overdueTodos.length,
        today: todayTodos.filter(t => !t.completed).length,
        upcoming: upcomingTodos.length,
      },
      streak: {
        current: currentStreak,
        best: bestStreak,
      },
      upcomingEvents,
      categoryStats,
      weeklyProductivity,
      timeProductivity,
      habitStreaks,
    };
  }, [todos, categories]);
}

