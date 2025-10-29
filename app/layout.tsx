import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const metadata: Metadata = {
  title: 'Todal - 수달처럼 귀엽고 영리한 일정 관리 🦦',
  description: '할일 관리와 시간 시각화를 하나로 통합한 생산성 앱',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todal',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#2D9F6B',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="touch-manipulation">
        <ThemeProvider>
          <div className="min-h-screen bg-cream dark:bg-dark-ocean transition-colors duration-normal">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
