/**
 * Sentry 에러 트래킹 설정
 * 
 * 사용 방법:
 * 1. Sentry 계정 생성: https://sentry.io
 * 2. Next.js 프로젝트 생성
 * 3. DSN 키 복사
 * 4. .env.local에 추가:
 *    NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
 *    SENTRY_AUTH_TOKEN=your-auth-token
 */

export interface SentryConfig {
  dsn: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

export function getSentryConfig(): SentryConfig {
  return {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production',
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% of transactions
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  };
}

/**
 * 에러를 Sentry로 전송
 * logger.ts에서 자동으로 호출됨
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return;
  }

  // Sentry SDK를 설치한 후 사용
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureException(error, {
  //   extra: context,
  // });

  console.error('[Sentry] Would capture:', error, context);
}

/**
 * 커스텀 이벤트를 Sentry로 전송
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  const config = getSentryConfig();
  
  if (!config.enabled) {
    return;
  }

  // Sentry SDK를 설치한 후 사용
  // import * as Sentry from '@sentry/nextjs';
  // Sentry.captureMessage(message, level);

  console.log('[Sentry] Would capture message:', message, level);
}

