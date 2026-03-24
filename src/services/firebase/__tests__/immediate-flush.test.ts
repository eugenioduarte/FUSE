import { immediateCollaborativeFlush } from '../immediate-flush'

const mockProcessOfflineQueue = jest.fn()
const mockFlushLocalCollaborativeChanges = jest.fn()

jest.mock('../../sync/sync.service', () => ({
  processOfflineQueue: () => mockProcessOfflineQueue(),
}))

jest.mock('../collab-flush.service', () => ({
  flushLocalCollaborativeChanges: () => mockFlushLocalCollaborativeChanges(),
}))

beforeEach(() => {
  jest.clearAllMocks()
  jest.useRealTimers()
  mockProcessOfflineQueue.mockResolvedValue(undefined)
  mockFlushLocalCollaborativeChanges.mockResolvedValue(undefined)
})

describe('immediateCollaborativeFlush', () => {
  it('returns "ok" when both flushes complete quickly', async () => {
    const result = await immediateCollaborativeFlush(5000)
    expect(result).toBe('ok')
  })

  it('returns "timeout" when the timeout expires before flush completes', async () => {
    jest.useFakeTimers()
    mockProcessOfflineQueue.mockReturnValue(new Promise(() => {})) // never resolves
    const promise = immediateCollaborativeFlush(100)
    jest.advanceTimersByTime(200)
    const result = await promise
    expect(result).toBe('timeout')
  })

  it('still returns "ok" when processOfflineQueue throws (errors are swallowed)', async () => {
    mockProcessOfflineQueue.mockRejectedValue(new Error('network'))
    const result = await immediateCollaborativeFlush(5000)
    expect(result).toBe('ok')
  })

  it('still returns "ok" when flushLocalCollaborativeChanges throws', async () => {
    mockFlushLocalCollaborativeChanges.mockRejectedValue(
      new Error('flush error'),
    )
    const result = await immediateCollaborativeFlush(5000)
    expect(result).toBe('ok')
  })
})
