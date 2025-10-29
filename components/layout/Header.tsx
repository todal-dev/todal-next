'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, LayoutDashboard, Calendar } from 'lucide-react';
import { GoogleCalendarSyncButton } from '@/components/calendar/GoogleCalendarSyncButton';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { SearchBar } from '@/components/search/SearchBar';
import type { Category, Todo } from '@/types/calendar';

interface HeaderProps {
  categories: Category[];
  onSelectTodo?: (todo: Todo) => void;
}

export function Header({ categories, onSelectTodo }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-gray-300 bg-white h-16 px-5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/logo.png" alt="Todal Logo" width={90} height={90} />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname === '/'
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-neutral-text-secondary hover:bg-neutral-gray-50 hover:text-neutral-text-primary'
            }`}
          >
            <Calendar size={18} />
            <span className="text-sm">캘린더</span>
          </Link>
          
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              pathname === '/dashboard'
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-neutral-text-secondary hover:bg-neutral-gray-50 hover:text-neutral-text-primary'
            }`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">대시보드</span>
          </Link>
        </nav>
      </div>

      <div className="flex gap-3 items-center">
        {/* 검색 바 */}
        <div className="w-80">
          <SearchBar categories={categories} onSelectTodo={onSelectTodo} />
        </div>

        {/* Actions */}
        <GoogleCalendarSyncButton />
        <LogoutButton />
      </div>
    </header>
  );
}

