import {
  parseLocalDate,
  formatLocalDate,
  isValidDate,
  isSameDay,
  getDateRange,
} from '@/lib/date-utils'

describe('date-utils', () => {
  describe('parseLocalDate', () => {
    it('should parse a valid date string', () => {
      const result = parseLocalDate('2025-10-29')
      expect(result).toBeInstanceOf(Date)
      expect(result.getFullYear()).toBe(2025)
      expect(result.getMonth()).toBe(9) // October (0-indexed)
      expect(result.getDate()).toBe(29)
    })

    it('should throw error for invalid date format', () => {
      expect(() => parseLocalDate('invalid-date')).toThrow()
      expect(() => parseLocalDate('2025/10/29')).toThrow()
      expect(() => parseLocalDate('29-10-2025')).toThrow()
    })
  })

  describe('formatLocalDate', () => {
    it('should format a date to YYYY-MM-DD', () => {
      const date = new Date(2025, 9, 29) // October 29, 2025
      expect(formatLocalDate(date)).toBe('2025-10-29')
    })

    it('should pad single-digit months and days', () => {
      const date = new Date(2025, 0, 5) // January 5, 2025
      expect(formatLocalDate(date)).toBe('2025-01-05')
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date(2025, 9, 29))).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate('2025-10-29')).toBe(false)
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same dates', () => {
      const date1 = new Date(2025, 9, 29, 10, 30)
      const date2 = new Date(2025, 9, 29, 15, 45)
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different dates', () => {
      const date1 = new Date(2025, 9, 29)
      const date2 = new Date(2025, 9, 30)
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('getDateRange', () => {
    it('should generate array of dates', () => {
      const start = new Date(2025, 9, 1)
      const end = new Date(2025, 9, 5)
      const range = getDateRange(start, end)
      
      expect(range).toHaveLength(5)
      expect(range[0]).toEqual(new Date(2025, 9, 1))
      expect(range[4]).toEqual(new Date(2025, 9, 5))
    })

    it('should return empty array if start > end', () => {
      const start = new Date(2025, 9, 5)
      const end = new Date(2025, 9, 1)
      const range = getDateRange(start, end)
      
      expect(range).toHaveLength(0)
    })
  })
})

