import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todal - 할일 + 캘린더 통합 관리',
  description: '할일 관리와 시간 시각화를 하나로 통합한 생산성 앱',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
