import type { Todo } from '@/types/calendar'

// Google Calendar API 타입 정의
export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  recurrence?: string[]
  status: string
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[]
  nextPageToken?: string
}

/**
 * Google Calendar 이벤트 → Todal Todo 변환
 */
export function convertGoogleEventToTodo(
  event: GoogleCalendarEvent,
  categoryId: string
): Omit<Todo, 'id' | 'subtasks'> {
  // 시간 추출
  const startDateTime = event.start.dateTime || event.start.date
  const endDateTime = event.end.dateTime || event.end.date

  // 날짜 파싱 (로컬 시간대 고려)
  let date: Date
  if (event.start.dateTime) {
    // 시간이 있는 이벤트
    date = new Date(event.start.dateTime)
  } else if (event.start.date) {
    // 종일 이벤트 (YYYY-MM-DD 형식)
    const [year, month, day] = event.start.date.split('-').map(Number)
    date = new Date(year, month - 1, day)
  } else {
    date = new Date(startDateTime!)
  }

  // 시간 형식 추출 (HH:mm, 초 제외)
  let startTime: string | undefined
  let endTime: string | undefined

  if (event.start.dateTime) {
    const startDate = new Date(event.start.dateTime)
    startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`
  }

  if (event.end.dateTime) {
    const endDate = new Date(event.end.dateTime)
    endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`
  }

  return {
    text: event.summary || '(제목 없음)',
    completed: false,
    date,
    categoryId,
    startTime,
    endTime,
  }
}

/**
 * Todal Todo → Google Calendar 이벤트 변환
 */
export function convertTodoToGoogleEvent(todo: Todo) {
  const date = todo.date
  const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD

  let start, end

  if (todo.startTime && todo.endTime) {
    // 시간이 있는 경우
    start = {
      dateTime: `${dateStr}T${todo.startTime}:00`,
      timeZone: 'Asia/Seoul',
    }
    end = {
      dateTime: `${dateStr}T${todo.endTime}:00`,
      timeZone: 'Asia/Seoul',
    }
  } else {
    // 종일 이벤트
    start = { date: dateStr }
    end = { date: dateStr }
  }

  return {
    summary: todo.text,
    start,
    end,
    description: `Created from Todal`,
  }
}

