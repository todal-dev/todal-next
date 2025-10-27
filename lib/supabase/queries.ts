'use server'

import { createClient } from '@/lib/supabase/server'
import type { Todo, Category, RecurrenceRule } from '@/types/calendar'

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
      categoryId: todo.category_id || 'cat-etc', // DB에 없으면 기본 "기타" 카테고리
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
        categoryId: st.category_id || 'cat-etc', // DB에 없으면 기본 "기타" 카테고리
        parentId: st.parent_id,
        startTime: st.start_time || undefined,
        endTime: st.end_time || undefined,
        subtasks: [],
      })),
    }
  })

  return todos
}

/**
 * Todo 생성
 */
export async function createTodo(
  text: string,
  categoryId: string,
  date: Date,
  parentId?: string,
  startTime?: string,
  endTime?: string
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    // 기본 카테고리 ID는 UUID가 아니므로 null로 저장
    const isDefaultCategory = categoryId.startsWith('cat');
    const dbCategoryId = isDefaultCategory ? null : categoryId;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        text,
        category_id: dbCategoryId,
        date: dateStr,
        parent_id: parentId || null,
        start_time: startTime || null,
        end_time: endTime || null,
        completed: false,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create todo:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Todo created:', data.id)

    // DB 데이터를 Todo 타입으로 변환
    const parseLocalDate = (dateString: string): Date => {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const todo: Todo = {
      id: data.id,
      text: data.text,
      completed: data.completed,
      date: parseLocalDate(data.date),
      categoryId: data.category_id || categoryId, // DB에 없으면 원래 categoryId 사용
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      parentId: data.parent_id || undefined,
      subtasks: [],
    }

    return { success: true, todo }
  } catch (error: any) {
    console.error('❌ Create todo error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Todo 수정
 */
export async function updateTodo(
  id: string,
  updates: {
    text?: string
    completed?: boolean
    categoryId?: string
    date?: Date
    startTime?: string
    endTime?: string
    parentId?: string
    completedDates?: string[]
    skippedDates?: string[]
    recurrenceRule?: RecurrenceRule
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const dbUpdates: any = {}
    
    if (updates.text !== undefined) dbUpdates.text = updates.text
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed
    if (updates.categoryId !== undefined) {
      // 기본 카테고리 ID는 UUID가 아니므로 null로 저장
      const isDefaultCategory = updates.categoryId.startsWith('cat');
      dbUpdates.category_id = isDefaultCategory ? null : updates.categoryId;
    }
    if (updates.date !== undefined) {
      // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
      const date = updates.date;
      dbUpdates.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime || null
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId || null
    if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates
    if (updates.skippedDates !== undefined) dbUpdates.skipped_dates = updates.skippedDates
    if (updates.recurrenceRule !== undefined) {
      // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
      const formatLocalDate = (d: Date) => 
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      dbUpdates.recurrence_rule = {
        frequency: updates.recurrenceRule.frequency,
        interval: updates.recurrenceRule.interval,
        startDate: updates.recurrenceRule.startDate ? formatLocalDate(updates.recurrenceRule.startDate) : undefined,
        endDate: updates.recurrenceRule.endDate ? formatLocalDate(updates.recurrenceRule.endDate) : undefined,
        daysOfWeek: updates.recurrenceRule.daysOfWeek,
      }
    }

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Failed to update todo:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Todo updated:', id)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Update todo error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Todo 삭제
 */
export async function deleteTodo(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 하위 작업도 함께 삭제
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Failed to delete todo:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Todo deleted:', id)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Delete todo error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 반복 일정 생성
 */
export async function createRecurringTodo(
  text: string,
  categoryId: string,
  date: Date,
  startTime: string,
  endTime: string,
  recurrenceRule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    interval: number
    startDate?: Date
    endDate?: Date
    daysOfWeek?: number[]
  }
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    // 기본 카테고리 ID는 UUID가 아니므로 null로 저장
    const isDefaultCategory = categoryId.startsWith('cat');
    const dbCategoryId = isDefaultCategory ? null : categoryId;

    // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환하는 헬퍼 함수
    const formatLocalDate = (d: Date) => 
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        text,
        category_id: dbCategoryId,
        date: dateStr,
        start_time: startTime,
        end_time: endTime,
        completed: false,
        recurrence_rule: {
          frequency: recurrenceRule.frequency,
          interval: recurrenceRule.interval,
          startDate: recurrenceRule.startDate ? formatLocalDate(recurrenceRule.startDate) : undefined,
          endDate: recurrenceRule.endDate ? formatLocalDate(recurrenceRule.endDate) : undefined,
          daysOfWeek: recurrenceRule.daysOfWeek,
        },
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create recurring todo:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Recurring todo created:', data.id)

    const parseLocalDate = (dateString: string): Date => {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day)
    }

    const todo: Todo = {
      id: data.id,
      text: data.text,
      completed: data.completed,
      date: parseLocalDate(data.date),
      categoryId: data.category_id || categoryId, // DB에 없으면 원래 categoryId 사용
      startTime: data.start_time || undefined,
      endTime: data.end_time || undefined,
      recurrenceRule: data.recurrence_rule ? {
        frequency: data.recurrence_rule.frequency,
        interval: data.recurrence_rule.interval,
        startDate: data.recurrence_rule.startDate ? parseLocalDate(data.recurrence_rule.startDate) : undefined,
        endDate: data.recurrence_rule.endDate ? parseLocalDate(data.recurrence_rule.endDate) : undefined,
        daysOfWeek: data.recurrence_rule.daysOfWeek,
      } : undefined,
      subtasks: [],
    }

    return { success: true, todo }
  } catch (error: any) {
    console.error('❌ Create recurring todo error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 카테고리 생성
 */
export async function createCategory(
  name: string,
  color: string
): Promise<{ success: boolean; category?: Category; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 현재 카테고리 개수를 가져와서 order 설정
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1)

    const nextOrder = existingCategories && existingCategories.length > 0 
      ? existingCategories[0].order + 1 
      : 0

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name,
        color,
        order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Failed to create category:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Category created:', data.id)

    const category: Category = {
      id: data.id,
      name: data.name,
      color: data.color,
    }

    return { success: true, category }
  } catch (error: any) {
    console.error('❌ Create category error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 카테고리 수정
 */
export async function updateCategory(
  id: string,
  updates: {
    name?: string
    color?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const dbUpdates: any = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.color !== undefined) dbUpdates.color = updates.color

    const { error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Failed to update category:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Category updated:', id)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Update category error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * 카테고리 삭제
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ Failed to delete category:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ Category deleted:', id)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Delete category error:', error)
    return { success: false, error: error.message }
  }
}

