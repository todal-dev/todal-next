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
    const startDateTime = event.start.dateTime || event.start.date
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
  
  // 로컬 시간 기준으로 날짜 문자열 생성 (UTC가 아닌)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateStr = `${year}-${month}-${day}` // YYYY-MM-DD

  let start, end

  if (todo.startTime && todo.endTime) {
    // 시간이 있는 경우
    // startTime이 "HH:mm" 형식이면 ":00" 추가, "HH:mm:ss" 형식이면 그대로 사용
    const startTimeFormatted = todo.startTime.length === 5 ? `${todo.startTime}:00` : todo.startTime
    const endTimeFormatted = todo.endTime.length === 5 ? `${todo.endTime}:00` : todo.endTime
    
    start = {
      dateTime: `${dateStr}T${startTimeFormatted}`,
      timeZone: 'Asia/Seoul',
    }
    end = {
      dateTime: `${dateStr}T${endTimeFormatted}`,
      timeZone: 'Asia/Seoul',
    }
  } else {
    // 종일 이벤트
    // Google Calendar API는 exclusive end date를 사용하므로 다음 날로 설정
    const endDate = new Date(date)
    endDate.setDate(endDate.getDate() + 1)
    const endYear = endDate.getFullYear()
    const endMonth = String(endDate.getMonth() + 1).padStart(2, '0')
    const endDay = String(endDate.getDate()).padStart(2, '0')
    const endDateStr = `${endYear}-${endMonth}-${endDay}`
    
    start = { date: dateStr }
    end = { date: endDateStr }
  }

  return {
    summary: todo.text,
    start,
    end,
    description: `Created from Todal`,
  }
}

