import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todal - 할일 + 캘린더 통합 관리',
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
    <html lang="ko">
      <body className="touch-manipulation">
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
