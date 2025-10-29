import { logger } from '@/lib/logger'

// Mock console methods
const originalConsole = global.console

describe('logger', () => {
  beforeEach(() => {
    global.console = {
      ...originalConsole,
      log: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
  })

  afterEach(() => {
    global.console = originalConsole
  })

  describe('debug', () => {
    it('should log in development environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      logger.debug('Test debug message')
      
      expect(console.log).toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
    })

    it('should not log in production environment', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      logger.debug('Test debug message')
      
      expect(console.log).not.toHaveBeenCalled()
      
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('sanitization', () => {
    it('should redact sensitive information', () => {
      logger.error('Login failed', new Error('test'), {
        email: 'user@example.com',
        password: 'secret123',
        token: 'abc123',
      })

      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('***REDACTED***')
      expect(errorCall).not.toContain('secret123')
      expect(errorCall).not.toContain('abc123')
    })

    it('should preserve non-sensitive data', () => {
      logger.info('User action', {
        userId: '123',
        action: 'click',
      })

      const infoCall = (console.info as jest.Mock).mock.calls[0][0]
      expect(infoCall).toContain('userId')
      expect(infoCall).toContain('123')
    })
  })

  describe('error handling', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error')
      logger.error('Error occurred', error)

      expect(console.error).toHaveBeenCalled()
      const errorCall = (console.error as jest.Mock).mock.calls[0][0]
      expect(errorCall).toContain('Test error')
    })

    it('should handle non-Error objects', () => {
      logger.error('Error occurred', 'string error')

      expect(console.error).toHaveBeenCalled()
    })
  })
})

