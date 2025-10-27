'use server'

import { createClient } from '@/lib/supabase/server'
import type { Todo, Category } from '@/types/calendar'

/**
 * 사용자의 모든 카테고리 가져오기
 */
export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('❌ fetchCategories: No user logged in')
    return []
  }

  console.log('✅ fetchCategories: User ID:', user.id)

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  if (error) {
    console.error('❌ Failed to fetch categories:', error)
    return []
  }

  console.log(`✅ fetchCategories: Found ${data?.length || 0} categories:`, data?.map(c => c.name))

  return (data || []).map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
  }))
}

/**
 * 사용자의 모든 할일 가져오기
 */
export async function fetchTodos(): Promise<Todo[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('❌ fetchTodos: No user logged in')
    return []
  }

  console.log('✅ fetchTodos: User ID:', user.id)

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null) // 최상위 할일만 (하위 작업 제외)
    .order('date', { ascending: true })

  if (error) {
    console.error('❌ Failed to fetch todos:', error)
    return []
  }

  console.log(`✅ fetchTodos: Found ${data?.length || 0} todos`)

  // 하위 작업도 가져오기
  const { data: subtasksData } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .not('parent_id', 'is', null)

  const subtasksMap = new Map<string, any[]>()
  subtasksData?.forEach(subtask => {
    if (!subtasksMap.has(subtask.parent_id)) {
      subtasksMap.set(subtask.parent_id, [])
    }
    subtasksMap.get(subtask.parent_id)!.push(subtask)
  })

  // 날짜 문자열을 로컬 시간대의 Date 객체로 변환하는 헬퍼 함수
  const parseLocalDate = (dateString: string): Date => {
    // YYYY-MM-DD 형식을 파싱하여 로컬 시간대로 변환
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  // DB 데이터를 Todo 타입으로 변환
  const todos = (data || []).map(todo => {
    const subtasks = subtasksMap.get(todo.id) || []
    
    return {
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      date: parseLocalDate(todo.date),
      categoryId: todo.category_id,
      startTime: todo.start_time || undefined,
      endTime: todo.end_time || undefined,
      googleEventId: todo.google_event_id || undefined,
      recurrenceRule: todo.recurrence_rule ? {
        frequency: todo.recurrence_rule.frequency,
        interval: todo.recurrence_rule.interval,
        startDate: todo.recurrence_rule.startDate ? parseLocalDate(todo.recurrence_rule.startDate) : undefined,
        endDate: todo.recurrence_rule.endDate ? parseLocalDate(todo.recurrence_rule.endDate) : undefined,
        daysOfWeek: todo.recurrence_rule.daysOfWeek,
      } : undefined,
      completedDates: todo.completed_dates || undefined,
      skippedDates: todo.skipped_dates || undefined,
      subtasks: subtasks.map(st => ({
        id: st.id,
        text: st.text,
        completed: st.completed,
        date: parseLocalDate(st.date),
        categoryId: st.category_id,
        parentId: st.parent_id,
        startTime: st.start_time || undefined,
        endTime: st.end_time || undefined,
        subtasks: [],
      })),
    }
  })

  return todos
}

