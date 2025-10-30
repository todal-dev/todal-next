import { CheckCircle2, TrendingUp, ListTodo, Flame } from 'lucide-react';
import { StatCard } from './StatCard';
import type { DashboardStats } from '@/hooks/data/useDashboard';

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 오늘 완료율 */}
      <StatCard
        title="오늘 완료"
        value={`${stats.todayStats.completed}/${stats.todayStats.total}`}
        subtitle={`완료율 ${stats.todayStats.percentage.toFixed(0)}%`}
        icon={CheckCircle2}
        iconColor="text-primary dark:text-primary-400"
        iconBgColor="bg-primary-50 dark:bg-primary-900/30"
        trend={{
          value: stats.todayStats.trend,
          isPositive: stats.todayStats.trend >= 0,
        }}
      />

      {/* 이번 주 완료율 */}
      <StatCard
        title="이번 주"
        value={`${stats.weekStats.completed}/${stats.weekStats.total}`}
        subtitle={`완료율 ${stats.weekStats.percentage.toFixed(0)}%`}
        icon={TrendingUp}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBgColor="bg-blue-50 dark:bg-blue-900/30"
        trend={{
          value: stats.weekStats.trend,
          isPositive: stats.weekStats.trend >= 0,
        }}
      />

      {/* 총 할일 */}
      <StatCard
        title="총 할일"
        value={stats.totalTodos.total.toString()}
        subtitle={
          stats.totalTodos.overdue > 0
            ? `기한 지남 ${stats.totalTodos.overdue}개`
            : `오늘 ${stats.totalTodos.today}개`
        }
        icon={ListTodo}
        iconColor="text-purple-600 dark:text-purple-400"
        iconBgColor="bg-purple-50 dark:bg-purple-900/30"
      />

      {/* 연속 달성 */}
      <StatCard
        title="연속 달성"
        value={`${stats.streak.current}일`}
        subtitle={`최고 기록 ${stats.streak.best}일`}
        icon={Flame}
        iconColor="text-orange-600 dark:text-orange-400"
        iconBgColor="bg-orange-50 dark:bg-orange-900/30"
      />
    </div>
  );
}

