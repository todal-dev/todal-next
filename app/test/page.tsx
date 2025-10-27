import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  // Test connection
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .limit(1)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error.message}</p>
          <p className="mt-2 text-sm">
            {error.message.includes('relation')
              ? '⚠️ 테이블이 아직 생성되지 않았습니다. 마이그레이션을 실행해주세요.'
              : '연결 설정을 확인해주세요.'}
          </p>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <p className="font-bold">✅ Supabase 연결 성공!</p>
          <p className="mt-2">환경변수가 올바르게 설정되었습니다.</p>
          {data && data.length > 0 && (
            <pre className="mt-2 text-xs bg-white p-2 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">환경변수 확인</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ 설정됨' : '❌ 없음'}</p>
          <p>Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 설정됨' : '❌ 없음'}</p>
        </div>
      </div>
    </div>
  )
}
