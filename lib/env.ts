/**
 * 환경 변수 검증 및 타입 안전성 보장
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export const env = {
  // Supabase
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
  
  // Google OAuth (선택적)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  
  // 환경
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

// 타입 안전성 확인
export type Env = typeof env;

