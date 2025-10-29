'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR 시 localStorage에서 읽은 값으로 초기화
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme: Theme = 'light';
    
    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (prefersDark) {
      initialTheme = 'dark';
    }
    
    console.log('🎨 초기 테마 설정:', initialTheme);
    setTheme(initialTheme);
    
    // DOM 직접 업데이트
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    console.log('🔄 toggleTheme 호출됨');
    console.log('현재 theme state:', theme);
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('새로운 theme:', newTheme);
    
    // State와 DOM을 동시에 업데이트
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    console.log('localStorage 저장 완료:', localStorage.getItem('theme'));
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      console.log('✅ dark 클래스 추가됨');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('✅ dark 클래스 제거됨');
    }
    
    console.log('최종 html.classList:', document.documentElement.classList.toString());
    console.log('최종 html에 dark 있음?:', document.documentElement.classList.contains('dark'));
    
    // 강제로 body 배경색 확인
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const htmlBg = window.getComputedStyle(document.documentElement).backgroundColor;
    console.log('최종 body 배경색:', bodyBg);
    console.log('최종 html 배경색:', htmlBg);
    
    // 테스트: 직접 요소 하나의 computed style 확인
    const header = document.querySelector('header');
    if (header) {
      console.log('Header 배경색:', window.getComputedStyle(header).backgroundColor);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

