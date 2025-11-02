import { motion } from 'framer-motion';
import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { format, isTomorrow, isToday } from 'date-fns';
import { ko } from 'date-fns/locale';
import Link from 'next/link';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface UpcomingEventsProps {
  events: DashboardStats['upcomingEvents'];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  // 시간에서 초 제거하는 헬퍼 함수
  const formatTime = (time: string) => {
    return time.split(':').slice(0, 2).join(':');
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return '오늘';
    if (isTomorrow(date)) return '내일';
    return format(date, 'M월 d일 (EEE)', { locale: ko });
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
    }
  };

  if (events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">📅 다가오는 일정</h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-6xl mb-4">🦦</div>
          <p className="text-body text-gray-600 dark:text-gray-400 mb-2">편안한 하루네요~</p>
          <p className="text-body-small text-gray-400 dark:text-gray-500">다가오는 일정이 없어요</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-warm-white dark:bg-dark-ocean-card rounded-lg border border-gray-200 dark:border-gray-600 transition-colors p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">📅 다가오는 일정</h3>
        <Link 
          href="/"
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center gap-1 transition-colors"
        >
          전체 보기 <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: 0.5 + index * 0.05 }}
            className={`border-l-4 ${getPriorityColor(event.priority)} bg-gray-50 dark:bg-gray-800 p-3 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm transition-all cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: event.category.color }}
              ></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-gray-50 text-sm truncate">{event.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{getDateLabel(event.date)}</span>
                  </div>
                  {event.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTime(event.startTime)}</span>
                      {event.endTime && <span>- {formatTime(event.endTime)}</span>}
                    </div>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ 
                    backgroundColor: event.category.color + '20',
                    color: event.category.color 
                  }}>
                    {event.category.name}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

