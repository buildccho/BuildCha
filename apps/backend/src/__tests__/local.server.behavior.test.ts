/* 
  Tests for local dev server bootstrap (apps/backend/src/__tests__/local.test.ts)

  Framework note:
  - The project’s existing test framework is used (Jest or Vitest). 
  - This file uses compatible APIs: vi/jest, describe/it/test, expect. 
  - If using Jest, vi will be undefined; if using Vitest, jest will be undefined. We normalize via small helpers.
*/

const isVitest = typeof vi !== 'undefined'
const mockFn = (...args) => (isVitest ? vi.fn(...args) : (jest as any).fn(...args))
const doMock = (mod, factory) => (isVitest ? vi.mock(mod, factory as any) : (jest as any).mock(mod, factory as any))
const resetModules = async () => {
  if (isVitest) {
    vi.resetModules()
  } else {
    // jest
    await (jest as any).resetModules()
  }
}
const clearAllMocks = () => {
  if (isVitest) vi.clearAllMocks()
  else (jest as any).clearAllMocks()
}
const restoreAllMocks = () => {
  if (isVitest) vi.restoreAllMocks()
  else (jest as any).restoreAllMocks()
}

describe('local dev server bootstrap (local.test.ts)', () => {
  const originalEnv = { ...process.env }
  let serveMock: any
  let logSpy: any

  beforeEach(async () => {
    process.env = { ...originalEnv }
    process.env.NODE_ENV = 'test'

    // Spy on console.log to verify message
    logSpy = (isVitest ? vi.spyOn(console, 'log') : (jest as any).spyOn(console, 'log')).mockImplementation(() => {})

    // Mock app default export with a fetch method
    doMock('../app', () => {
      return {
        __esModule: true,
        default: { fetch: mockFn() }
      }
    })

    // Mock serve from @hono/node-server
    serveMock = mockFn()
    doMock('@hono/node-server', () => {
      return {
        __esModule: true,
        serve: serveMock
      }
    })

    await resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
    restoreAllMocks()
    clearAllMocks()
  })

  async function importTarget() {
    // Import after mocks are set so side effects run with mocked modules
    return await import('./local.test') // relative to this test file
  }

  it('starts server on default port 8000 when PORT is not set and logs message', async () => {
    delete process.env.PORT
    await importTarget()

    expect(serveMock).toHaveBeenCalledTimes(1)
    const args = serveMock.mock.calls[0][0]
    expect(args).toBeDefined()
    expect(typeof args.fetch).toBe('function')
    expect(args.port).toBe(8000)

    expect(logSpy).toHaveBeenCalledWith('Local server is running on port 8000')
  })

  it('respects PORT from environment (e.g., 5050)', async () => {
    process.env.PORT = '5050'
    await importTarget()

    expect(serveMock).toHaveBeenCalledTimes(1)
    const args = serveMock.mock.calls[0][0]
    expect(args.port).toBe(5050)
    expect(logSpy).toHaveBeenCalledWith('Local server is running on port 5050')
  })

  it('handles non-numeric PORT by falling back to Number() semantics (NaN -> port NaN)', async () => {
    // In current implementation, Number("not-a-number") yields NaN.
    // We validate current behavior so future refactors can choose to guard this case.
    process.env.PORT = 'not-a-number'
    await importTarget()

    expect(serveMock).toHaveBeenCalledTimes(1)
    const args = serveMock.mock.calls[0][0]
    // NaN !== NaN; check via Number.isNaN
    expect(Number.isNaN(args.port)).toBe(true)
    // For log, template literal will show "NaN"
    expect(logSpy).toHaveBeenCalledWith('Local server is running on port NaN')
  })

  it('passes through the app.fetch function to serve()', async () => {
    await importTarget()
    const call = serveMock.mock.calls[0][0]
    expect(call).toHaveProperty('fetch')
    expect(typeof call.fetch).toBe('function')
  })
})