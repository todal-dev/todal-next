import { createClient } from '@/lib/supabase/server'

export default async function TestDBPage() {
  const supabase = await createClient()
  
  // 현재 사용자 확인
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">❌ 로그인 필요</h1>
        <p>로그인 후 다시 시도해주세요.</p>
      </div>
    )
  }
  
  // 카테고리 조회
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
  
  // 할일 조회
  const { data: todos, error: todoError } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📊 데이터베이스 확인</h1>
      
      {/* 사용자 정보 */}
      <div className="mb-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">👤 사용자</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>
      
      {/* 카테고리 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">📁 카테고리 ({categories?.length || 0}개)</h2>
        {catError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
            ❌ {catError.message}
          </div>
        )}
        {categories && categories.length > 0 ? (
          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat.id} className="p-3 bg-white border rounded-lg flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium">{cat.name}</span>
                <span className="text-sm text-gray-500">({cat.id.substring(0, 8)}...)</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">카테고리가 없습니다.</p>
        )}
      </div>
      
      {/* 할일 */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">✅ 할일 ({todos?.length || 0}개)</h2>
        {todoError && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">
            ❌ {todoError.message}
          </div>
        )}
        {todos && todos.length > 0 ? (
          <div className="space-y-2">
            {todos.map(todo => {
              const category = categories?.find(c => c.id === todo.category_id)
              return (
                <div key={todo.id} className="p-4 bg-white border rounded-lg">
                  <div className="flex items-start gap-3">
                    <input 
                      type="checkbox" 
                      checked={todo.completed} 
                      readOnly
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.text}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>📅 {todo.date}</span>
                        {todo.start_time && <span>🕐 {todo.start_time} - {todo.end_time}</span>}
                        {category && (
                          <span className="flex items-center gap-1">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </span>
                        )}
                        {todo.google_event_id && (
                          <span className="text-blue-600">📅 Google 동기화됨</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500">할일이 없습니다.</p>
        )}
      </div>
      
      {/* Raw Data */}
      <details className="mt-8">
        <summary className="text-lg font-bold cursor-pointer mb-4">🔍 Raw Data (JSON)</summary>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Categories:</h3>
            <pre className="p-4 bg-gray-100 rounded-lg overflow-auto text-xs">
              {JSON.stringify(categories, null, 2)}
            </pre>
          </div>
          <div>
            <h3 className="font-bold mb-2">Todos:</h3>
            <pre className="p-4 bg-gray-100 rounded-lg overflow-auto text-xs">
              {JSON.stringify(todos, null, 2)}
            </pre>
          </div>
        </div>
      </details>
      
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="font-bold mb-2">💡 참고</p>
        <p className="text-sm">
          이 페이지는 Supabase 데이터베이스에 저장된 실제 데이터를 보여줍니다.
          메인 페이지에서 데이터가 보이지 않는다면, 데이터 로딩 로직을 추가해야 합니다.
        </p>
      </div>
      
      <div className="mt-4">
        <a 
          href="/" 
          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          ← 메인 페이지로 돌아가기
        </a>
      </div>
    </div>
  )
}


