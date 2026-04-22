import { beforeAll, vi } from 'vitest'

// Mock fetch for API tests
global.fetch = vi.fn()

// Mock window object for node environment
if (typeof window === 'undefined') {
  (global as any).window = {
    matchMedia: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  }
}
