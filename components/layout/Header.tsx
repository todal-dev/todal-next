'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Search, LayoutDashboard, Calendar, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="border-b border-neutral-gray-300 bg-white h-14 sm:h-16 px-3 sm:px-5 flex items-center justify-between relative z-30">
      <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image 
            src="/logo.png" 
            alt="Todal Logo" 
            width={70} 
            height={70}
            className="sm:w-[90px] sm:h-[90px]"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
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

      <div className="flex gap-2 sm:gap-3 items-center">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          className="md:hidden p-2 rounded-md hover:bg-neutral-gray-50 transition-colors"
          aria-label="검색"
        >
          <Search size={20} className="text-neutral-text-secondary" />
        </button>

        {/* Desktop Search Bar */}
        <div className="hidden md:block w-64 lg:w-80">
          <SearchBar categories={categories} onSelectTodo={onSelectTodo || (() => {})} />
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex gap-2 items-center">
          <GoogleCalendarSyncButton />
          <LogoutButton />
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md hover:bg-neutral-gray-50 transition-colors"
          aria-label="메뉴"
        >
          {isMobileMenuOpen ? (
            <X size={20} className="text-neutral-text-secondary" />
          ) : (
            <Menu size={20} className="text-neutral-text-secondary" />
          )}
        </button>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-gray-300 p-3 shadow-lg z-40">
          <SearchBar categories={categories} onSelectTodo={onSelectTodo || (() => {})} />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-neutral-gray-300 shadow-lg z-40">
          <nav className="flex flex-col p-3 gap-2">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                pathname === '/'
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-neutral-text-secondary hover:bg-neutral-gray-50 hover:text-neutral-text-primary'
              }`}
            >
              <Calendar size={20} />
              <span className="text-base">캘린더</span>
            </Link>
            
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-neutral-text-secondary hover:bg-neutral-gray-50 hover:text-neutral-text-primary'
              }`}
            >
              <LayoutDashboard size={20} />
              <span className="text-base">대시보드</span>
            </Link>

            <div className="border-t border-neutral-gray-300 my-2"></div>

            <div className="flex flex-col gap-2 px-2">
              <GoogleCalendarSyncButton />
              <LogoutButton />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

