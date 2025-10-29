'use server'

import { createClient } from '@/lib/supabase/server'
import type { Todo, Category, RecurrenceRule } from '@/types/calendar'
import { parseLocalDate, formatLocalDate } from '@/lib/date-utils'
import { logger } from '@/lib/logger'

/**
 * 사용자의 모든 카테고리 가져오기
 */
export async function fetchCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    logger.warn('No user logged in for fetchCategories')
    return []
  }

  logger.debug('Fetching categories', { userId: user.id })

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  if (error) {
    logger.error('Failed to fetch categories', error)
    return []
  }

  logger.debug('Categories fetched successfully', { count: data?.length || 0 })

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
    logger.warn('No user logged in for fetchTodos')
    return []
  }

  logger.debug('Fetching todos', { userId: user.id })

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .is('parent_id', null) // 최상위 할일만 (하위 작업 제외)
    .order('date', { ascending: true })

  if (error) {
    logger.error('Failed to fetch todos', error)
    return []
  }

  logger.debug('Todos fetched successfully', { count: data?.length || 0 })

  // 하위 작업도 가져오기
  const { data: subtasksData } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .not('parent_id', 'is', null)

  interface DbTodo {
    id: string;
    text: string;
    completed: boolean;
    date: string;
    category_id: string | null;
    parent_id: string | null;
    start_time: string | null;
    end_time: string | null;
    google_event_id: string | null;
    recurrence_rule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
      interval: number;
      startDate?: string;
      endDate?: string;
      count?: number;
      daysOfWeek?: number[];
      monthDay?: number;
      month?: number;
      nthWeekday?: {
        nth: number;
        weekday: number;
      };
      exceptions?: string[];
    } | null;
    completed_dates: string[] | null;
    skipped_dates: string[] | null;
  }

  const subtasksMap = new Map<string, DbTodo[]>()
  subtasksData?.forEach(subtask => {
    if (!subtasksMap.has(subtask.parent_id)) {
      subtasksMap.set(subtask.parent_id, [])
    }
    subtasksMap.get(subtask.parent_id)!.push(subtask)
  })

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
        count: todo.recurrence_rule.count,
        daysOfWeek: todo.recurrence_rule.daysOfWeek,
        monthDay: todo.recurrence_rule.monthDay,
        month: todo.recurrence_rule.month,
        nthWeekday: todo.recurrence_rule.nthWeekday,
        exceptions: todo.recurrence_rule.exceptions,
      } : undefined,
      completedDates: todo.completed_dates || undefined,
      skippedDates: todo.skipped_dates || undefined,
      subtasks: subtasks.map(st => ({
        id: st.id,
        text: st.text,
        completed: st.completed,
        date: parseLocalDate(st.date),
        categoryId: st.category_id || 'cat-etc', // DB에 없으면 기본 "기타" 카테고리
        parentId: st.parent_id || undefined,
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
    const dateStr = formatLocalDate(date)

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
      logger.error('Failed to create todo', error)
      return { success: false, error: error.message }
    }

    logger.info('Todo created successfully', { todoId: data.id })

    // DB 데이터를 Todo 타입으로 변환
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
  } catch (error) {
    logger.error('Create todo error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
  }
}

/**
 * Todo 수정
 */
interface DbUpdatePayload {
  text?: string;
  completed?: boolean;
  category_id?: string | null;
  date?: string;
  start_time?: string | null;
  end_time?: string | null;
  parent_id?: string | null;
  completed_dates?: string[];
  skipped_dates?: string[];
  recurrence_rule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    startDate?: string;
    endDate?: string;
    count?: number;
    daysOfWeek?: number[];
    monthDay?: number;
    month?: number;
    nthWeekday?: {
      nth: number;
      weekday: number;
    };
    exceptions?: string[];
  };
}

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

    const dbUpdates: DbUpdatePayload = {}
    
    if (updates.text !== undefined) dbUpdates.text = updates.text
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed
    if (updates.categoryId !== undefined) {
      // 기본 카테고리 ID는 UUID가 아니므로 null로 저장
      const isDefaultCategory = updates.categoryId.startsWith('cat');
      dbUpdates.category_id = isDefaultCategory ? null : updates.categoryId;
    }
    if (updates.date !== undefined) {
      // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
      dbUpdates.date = formatLocalDate(updates.date);
    }
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime || null
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime || null
    if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId || null
    if (updates.completedDates !== undefined) dbUpdates.completed_dates = updates.completedDates
    if (updates.skippedDates !== undefined) dbUpdates.skipped_dates = updates.skippedDates
    if (updates.recurrenceRule !== undefined) {
      dbUpdates.recurrence_rule = {
        frequency: updates.recurrenceRule.frequency,
        interval: updates.recurrenceRule.interval,
        startDate: updates.recurrenceRule.startDate ? formatLocalDate(updates.recurrenceRule.startDate) : undefined,
        endDate: updates.recurrenceRule.endDate ? formatLocalDate(updates.recurrenceRule.endDate) : undefined,
        count: updates.recurrenceRule.count,
        daysOfWeek: updates.recurrenceRule.daysOfWeek,
        monthDay: updates.recurrenceRule.monthDay,
        month: updates.recurrenceRule.month,
        nthWeekday: updates.recurrenceRule.nthWeekday,
        exceptions: updates.recurrenceRule.exceptions,
      }
    }

    const { error } = await supabase
      .from('todos')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to update todo', error)
      return { success: false, error: error.message }
    }

    logger.debug('Todo updated successfully', { todoId: id })
    return { success: true }
  } catch (error) {
    logger.error('Update todo error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
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
      logger.error('Failed to delete todo', error)
      return { success: false, error: error.message }
    }

    logger.debug('Todo deleted successfully', { todoId: id })
    return { success: true }
  } catch (error) {
    logger.error('Delete todo error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
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
  recurrenceRule: RecurrenceRule
): Promise<{ success: boolean; todo?: Todo; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: '로그인이 필요합니다.' }
    }

    // 로컬 시간대를 유지하면서 YYYY-MM-DD 형식으로 변환
    const dateStr = formatLocalDate(date)

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
        start_time: startTime,
        end_time: endTime,
        completed: false,
        recurrence_rule: {
          frequency: recurrenceRule.frequency,
          interval: recurrenceRule.interval,
          startDate: recurrenceRule.startDate ? formatLocalDate(recurrenceRule.startDate) : undefined,
          endDate: recurrenceRule.endDate ? formatLocalDate(recurrenceRule.endDate) : undefined,
          count: recurrenceRule.count,
          daysOfWeek: recurrenceRule.daysOfWeek,
          monthDay: recurrenceRule.monthDay,
          month: recurrenceRule.month,
          nthWeekday: recurrenceRule.nthWeekday,
          exceptions: recurrenceRule.exceptions,
        },
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create recurring todo', error)
      return { success: false, error: error.message }
    }

    logger.info('Recurring todo created successfully', { todoId: data.id })

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
        count: data.recurrence_rule.count,
        daysOfWeek: data.recurrence_rule.daysOfWeek,
        monthDay: data.recurrence_rule.monthDay,
        month: data.recurrence_rule.month,
        nthWeekday: data.recurrence_rule.nthWeekday,
        exceptions: data.recurrence_rule.exceptions,
      } : undefined,
      subtasks: [],
    }

    return { success: true, todo }
  } catch (error) {
    logger.error('Create recurring todo error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
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
      logger.error('Failed to create category', error)
      return { success: false, error: error.message }
    }

    logger.info('Category created successfully', { categoryId: data.id })

    const category: Category = {
      id: data.id,
      name: data.name,
      color: data.color,
    }

    return { success: true, category }
  } catch (error) {
    logger.error('Create category error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
  }
}

/**
 * 카테고리 수정
 */
interface DbCategoryUpdatePayload {
  name?: string;
  color?: string;
}

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

    const dbUpdates: DbCategoryUpdatePayload = {}
    
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.color !== undefined) dbUpdates.color = updates.color

    const { error } = await supabase
      .from('categories')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to update category', error)
      return { success: false, error: error.message }
    }

    logger.debug('Category updated successfully', { categoryId: id })
    return { success: true }
  } catch (error) {
    logger.error('Update category error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
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
      logger.error('Failed to delete category', error)
      return { success: false, error: error.message }
    }

    logger.debug('Category deleted successfully', { categoryId: id })
    return { success: true }
  } catch (error) {
    logger.error('Delete category error', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    }
  }
}

/**
 * 할일 검색 (제목으로)
 */
export async function searchTodos(query: string): Promise<Todo[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    logger.warn('No user logged in for searchTodos')
    return []
  }

  // 검색어가 없으면 빈 배열 반영
  if (!query.trim()) {
    return []
  }

  logger.debug('Searching todos', { userId: user.id, query })

  try {
    // text 필드에서 검색 (ilike는 대소문자 구분 없음)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .ilike('text', `%${query}%`)
      .order('date', { ascending: false })
      .limit(50) // 최대 50개 결과

    if (error) {
      logger.error('Failed to search todos', error)
      return []
    }

    if (!data) return []

    logger.debug('Search completed', { count: data.length })

    return data.map((todo): Todo => ({
      id: todo.id,
      text: todo.text,
      completed: todo.completed,
      date: parseLocalDate(todo.date),
      categoryId: todo.category_id || 'cat-etc', // DB에 없으면 기본 "기타" 카테고리
      startTime: todo.start_time || undefined,
      endTime: todo.end_time || undefined,
      recurrenceRule: todo.recurrence_rule as RecurrenceRule | undefined,
      completedDates: todo.completed_dates || undefined,
      skippedDates: todo.skipped_dates || undefined,
      googleEventId: todo.google_event_id || undefined,
      parentId: todo.parent_id || undefined,
      subtasks: [], // 검색 결과에는 하위 작업을 포함하지 않음
    }))
  } catch (error) {
    logger.error('Search todos error', error)
    return []
  }
}

