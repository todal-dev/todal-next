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
        className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors p-5"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">📅 다가오는 일정</h3>
        <div className="flex flex-col items-center justify-center py-8 text-gray-600 dark:text-gray-400">
          <Calendar size={48} className="mb-3 opacity-30" />
          <p className="text-sm">다가오는 일정이 없습니다</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 transition-colors p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">📅 다가오는 일정</h3>
        <Link 
          href="/"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
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
            className={`border-l-4 ${getPriorityColor(event.priority)} bg-gray-50 dark:bg-gray-800 p-3 rounded-r-lg hover:bg-gray-100 dark:bg-gray-700 transition-colors cursor-pointer`}
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
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
                      <span>{event.startTime}</span>
                      {event.endTime && <span>- {event.endTime}</span>}
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

