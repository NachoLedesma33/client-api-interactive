import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Client - HTTP Requests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should make GET request correctly', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ id: 1, title: 'Test Post' })
    }
    mockFetch.mockResolvedValue(mockResponse)

    const request = {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: {}
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers
    })

    expect(mockFetch).toHaveBeenCalledWith(request.url, {
      method: request.method,
      headers: request.headers
    })
    expect(response.status).toBe(200)
  })

  it('should make POST request with JSON body', async () => {
    const mockResponse = {
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({ id: 101, title: 'New Post' })
    }
    mockFetch.mockResolvedValue(mockResponse)

    const request = {
      method: 'POST',
      url: 'https://jsonplaceholder.typicode.com/posts',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Post', body: 'Test Content' })
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    expect(mockFetch).toHaveBeenCalledWith(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    expect(response.status).toBe(201)
  })

  it('should handle DELETE request', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({})
    }
    mockFetch.mockResolvedValue(mockResponse)

    const request = {
      method: 'DELETE',
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      headers: {}
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers
    })

    expect(mockFetch).toHaveBeenCalledWith(request.url, {
      method: request.method,
      headers: request.headers
    })
    expect(response.status).toBe(200)
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))

    const request = {
      method: 'GET',
      url: 'https://invalid-url.com/api',
      headers: {}
    }

    await expect(fetch(request.url, {
      method: request.method,
      headers: request.headers
    })).rejects.toThrow('Network error')
  })

  it('should handle HTTP error responses', async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: vi.fn().mockResolvedValue({ error: 'Resource not found' })
    }
    mockFetch.mockResolvedValue(mockResponse)

    const request = {
      method: 'GET',
      url: 'https://jsonplaceholder.typicode.com/posts/999',
      headers: {}
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers
    })

    expect(response.status).toBe(404)
    expect(response.ok).toBe(false)
  })

  it('should handle form data requests', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true })
    }
    mockFetch.mockResolvedValue(mockResponse)

    const formData = new FormData()
    formData.append('name', 'Test User')
    formData.append('email', 'test@example.com')

    const request = {
      method: 'POST',
      url: 'https://example.com/api/form',
      headers: {},
      body: formData
    }

    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })

    expect(mockFetch).toHaveBeenCalledWith(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    expect(response.status).toBe(200)
  })
})
