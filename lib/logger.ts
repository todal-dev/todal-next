/**
 * 로깅 시스템
 * - 개발 환경: 모든 로그 출력
 * - 프로덕션 환경: 에러만 출력, 민감 정보 제거
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }
  
  private sanitize(data: unknown): unknown {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    const sanitized = { ...data } as Record<string, unknown>;
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization'];
    
    for (const key in sanitized) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        sanitized[key] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
  
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, context));
    }
  }
  
  info(message: string, context?: LogContext): void {
    console.info(this.formatMessage('info', message, context));
  }
  
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, this.sanitize(context) as LogContext));
  }
  
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } : error,
    };
    
    console.error(this.formatMessage('error', message, this.sanitize(errorContext) as LogContext));
    
    // 프로덕션에서는 여기에 Sentry 등 에러 트래킹 서비스로 전송
    if (!this.isDevelopment && typeof window === 'undefined') {
      // TODO: Sentry.captureException(error);
    }
  }
}

export const logger = new Logger();

