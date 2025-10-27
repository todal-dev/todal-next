'use server'

import { createClient } from '@/lib/supabase/server'
import type { Todo } from '@/types/calendar'
import {
  convertGoogleEventToTodo,
  convertTodoToGoogleEvent,
  type GoogleCalendarEvent,
  type GoogleCalendarListResponse,
} from './calendar-utils'

/**
 * Google Access Token 가져오기
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    console.error('Session error:', error)
    return null
  }

  // Supabase는 Google OAuth 시 provider_token에 Access Token을 저장
  return session.provider_token ?? null
}

/**
 * Google Calendar에서 이벤트 가져오기
 */
export async function fetchGoogleCalendarEvents(
  startDate?: Date,
  endDate?: Date
): Promise<GoogleCalendarEvent[]> {
  const accessToken = await getGoogleAccessToken()

  if (!accessToken) {
    throw new Error('Google 로그인이 필요합니다. Google로 로그인해주세요.')
  }

  // 기본값: 이번 달
  const start = startDate || new Date()
  start.setDate(1)
  start.setHours(0, 0, 0, 0)

  const end = endDate || new Date()
  end.setMonth(end.getMonth() + 1)
  end.setDate(0)
  end.setHours(23, 59, 59, 999)

  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
  url.searchParams.append('timeMin', start.toISOString())
  url.searchParams.append('timeMax', end.toISOString())
  url.searchParams.append('singleEvents', 'true')
  url.searchParams.append('orderBy', 'startTime')
  url.searchParams.append('maxResults', '250')

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Google Calendar API 오류: ${error.error?.message || response.statusText}`)
    }

    const data: GoogleCalendarListResponse = await response.json()
    return data.items || []
  } catch (error) {
    console.error('Google Calendar fetch error:', error)
    throw error
  }
}


/**
 * Google Calendar 이벤트를 Supabase에 저장
 */
export async function importGoogleEventsToSupabase(
  events: GoogleCalendarEvent[]
): Promise<{ success: number; failed: number; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('로그인이 필요합니다.')
    }

    // "Google Calendar" 카테고리 찾기 또는 생성
    let { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Google Calendar')
      .eq('user_id', user.id)

    let categoryId: string

    if (catError || !categories || categories.length === 0) {
      // 카테고리 생성
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: 'Google Calendar',
          color: '#4285F4', // Google Blue
          order: 999,
        })
        .select('id')
        .single()

      if (createError || !newCategory) {
        throw new Error('카테고리 생성 실패: ' + createError?.message)
      }

      categoryId = newCategory.id
    } else {
      categoryId = categories[0].id
    }

    // 이벤트 → Todo 변환
    const todos = events.map(event => {
      const todo = convertGoogleEventToTodo(event, categoryId)
      return {
        user_id: user.id,
        category_id: categoryId,
        text: todo.text,
        completed: todo.completed,
        date: todo.date.toISOString().split('T')[0], // YYYY-MM-DD
        start_time: todo.startTime || null,
        end_time: todo.endTime || null,
        google_event_id: event.id, // Google Event ID 저장
      }
    })

    // 중복 확인을 위해 기존 데이터 조회 (google_event_id로 확인)
    const existingTodos = await supabase
      .from('todos')
      .select('google_event_id')
      .eq('category_id', categoryId)
      .eq('user_id', user.id)
      .not('google_event_id', 'is', null)

    const existingEventIds = new Set(
      (existingTodos.data || []).map(t => t.google_event_id)
    )

    // 중복 제거 (이미 가져온 이벤트는 제외)
    const newTodos = todos.filter(
      t => !existingEventIds.has(t.google_event_id)
    )

    if (newTodos.length === 0) {
      return { success: 0, failed: 0, error: '새로운 이벤트가 없습니다.' }
    }

    // Supabase에 삽입
    const { error: insertError } = await supabase
      .from('todos')
      .insert(newTodos)

    if (insertError) {
      throw new Error('Todo 저장 실패: ' + insertError.message)
    }

    return {
      success: newTodos.length,
      failed: 0,
    }
  } catch (error: any) {
    console.error('Import error:', error)
    return {
      success: 0,
      failed: events.length,
      error: error.message,
    }
  }
}

/**
 * 전체 동기화 (가져오기)
 */
export async function syncGoogleCalendarToTodal() {
  const events = await fetchGoogleCalendarEvents()
  const result = await importGoogleEventsToSupabase(events)
  return result
}

// ============================================
// Google Calendar 쓰기 (Todal → Google)
// ============================================

/**
 * Google Calendar에 이벤트 생성
 */
export async function createGoogleCalendarEvent(todo: Todo): Promise<{ success: boolean; error?: string; eventId?: string }> {
  try {
    const accessToken = await getGoogleAccessToken()

    if (!accessToken) {
      return { success: false, error: 'Google 로그인이 필요합니다.' }
    }

    const eventData = convertTodoToGoogleEvent(todo)

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '이벤트 생성 실패')
    }

    const result = await response.json()

    return {
      success: true,
      eventId: result.id,
    }
  } catch (error: any) {
    console.error('Create event error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Google Calendar 이벤트 업데이트
 */
export async function updateGoogleCalendarEvent(
  eventId: string,
  todo: Todo
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getGoogleAccessToken()

    if (!accessToken) {
      return { success: false, error: 'Google 로그인이 필요합니다.' }
    }

    const eventData = convertTodoToGoogleEvent(todo)

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || '이벤트 업데이트 실패')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Update event error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Google Calendar 이벤트 삭제
 */
export async function deleteGoogleCalendarEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getGoogleAccessToken()

    if (!accessToken) {
      return { success: false, error: 'Google 로그인이 필요합니다.' }
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (!response.ok && response.status !== 410) { // 410 = already deleted
      const error = await response.json()
      throw new Error(error.error?.message || '이벤트 삭제 실패')
    }

    return { success: true }
  } catch (error: any) {
    console.error('Delete event error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Todal의 모든 할일을 Google Calendar로 내보내기
 */
export async function exportTodosToGoogleCalendar(): Promise<{ success: number; failed: number; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('로그인이 필요합니다.')
    }

    // Google Event ID가 없는 Todo들만 가져오기
    const { data: todos, error: todosError } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .is('google_event_id', null)
      .is('parent_id', null) // 최상위 Todo만 (하위 작업 제외)

    if (todosError || !todos) {
      throw new Error('Todo 조회 실패: ' + todosError?.message)
    }

    if (todos.length === 0) {
      return { success: 0, failed: 0, error: '내보낼 할일이 없습니다.' }
    }

    let success = 0
    let failed = 0

    // 각 Todo를 Google Calendar에 생성
    for (const todoRow of todos) {
      const todo: Todo = {
        id: todoRow.id,
        text: todoRow.text,
        completed: todoRow.completed,
        date: new Date(todoRow.date),
        categoryId: todoRow.category_id,
        startTime: todoRow.start_time || undefined,
        endTime: todoRow.end_time || undefined,
        subtasks: [],
      }

      const result = await createGoogleCalendarEvent(todo)

      if (result.success && result.eventId) {
        // Google Event ID를 DB에 저장
        await supabase
          .from('todos')
          .update({ google_event_id: result.eventId })
          .eq('id', todoRow.id)

        success++
      } else {
        failed++
      }
    }

    return { success, failed }
  } catch (error: any) {
    console.error('Export error:', error)
    return {
      success: 0,
      failed: 0,
      error: error.message,
    }
  }
}
