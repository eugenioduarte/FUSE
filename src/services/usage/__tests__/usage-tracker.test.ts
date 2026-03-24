import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  clearAllTotals,
  debugActiveSessions,
  getDailyTotals,
  getSessions,
  startSession,
  stopSession,
  stopSessionByKey,
} from '../usage-tracker'

beforeEach(() => {
  jest.clearAllMocks()
  // reset in-memory sessions by stopping any leaked sessions
  const active = debugActiveSessions()
  Object.keys(active).forEach((k) => stopSessionByKey(k))
})

describe('startSession', () => {
  it('returns a session key in the expected format', async () => {
    const key = await startSession('t1', 'summary', 's1')
    expect(key).toBe('t1::summary::s1')
  })

  it('records the key in debugActiveSessions', async () => {
    const key = await startSession('t2', 'challenge')
    expect(debugActiveSessions()[key]).toBeDefined()
  })

  it('does not duplicate if called twice with the same key', async () => {
    const key = await startSession('t3', 'summary')
    const first = debugActiveSessions()[key]
    await startSession('t3', 'summary')
    // start time must not be overwritten
    expect(debugActiveSessions()[key]).toBe(first)
  })
})

describe('stopSessionByKey', () => {
  it('returns 0 for an unknown key', async () => {
    const minutes = await stopSessionByKey('unknown::key')
    expect(minutes).toBe(0)
  })

  it('removes the key from active sessions after stopping', async () => {
    const key = await startSession('t4', 'challenge_list')
    await stopSessionByKey(key)
    expect(debugActiveSessions()[key]).toBeUndefined()
  })

  it('persists the session record to AsyncStorage', async () => {
    const key = await startSession('t5', 'summary')
    await stopSessionByKey(key)
    expect(AsyncStorage.setItem).toHaveBeenCalled()
  })
})

describe('stopSession', () => {
  it('is a convenience wrapper returning same result as stopSessionByKey', async () => {
    await startSession('t6', 'summary', 'sX')
    const minutes = await stopSession('t6', 'summary', 'sX')
    expect(typeof minutes).toBe('number')
    expect(minutes).toBeGreaterThanOrEqual(0)
  })
})

describe('getDailyTotals', () => {
  it('returns empty object when no data is stored', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
    const totals = await getDailyTotals('topic-none')
    expect(totals).toEqual({})
  })

  it('returns stored totals for the given topicId', async () => {
    const stored = { 'topic-A': { '2026-03-24': 30 } }
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(stored),
    )
    const totals = await getDailyTotals('topic-A')
    expect(totals).toEqual({ '2026-03-24': 30 })
  })

  it('returns empty object when topicId is not in storage', async () => {
    const stored = { 'topic-B': { '2026-03-24': 10 } }
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(stored),
    )
    const totals = await getDailyTotals('topic-C')
    expect(totals).toEqual({})
  })
})

describe('getSessions', () => {
  it('returns all sessions when no topicId filter is provided', async () => {
    const sessions = [
      { topicId: 'a', scope: 'summary', start: 100, end: 200 },
      { topicId: 'b', scope: 'challenge', start: 300, end: 400 },
    ]
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(sessions),
    )
    const result = await getSessions()
    expect(result).toEqual(sessions)
  })

  it('filters sessions by topicId', async () => {
    const sessions = [
      { topicId: 'a', scope: 'summary', start: 100, end: 200 },
      { topicId: 'b', scope: 'challenge', start: 300, end: 400 },
    ]
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify(sessions),
    )
    const result = await getSessions('a')
    expect(result).toHaveLength(1)
    expect(result[0].topicId).toBe('a')
  })

  it('returns empty array when storage is empty', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
    expect(await getSessions()).toEqual([])
  })
})

describe('clearAllTotals', () => {
  it('calls AsyncStorage.removeItem with the correct key', async () => {
    await clearAllTotals()
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      'study_time_by_topic_v1',
    )
  })
})

describe('debugActiveSessions', () => {
  it('returns a snapshot of active sessions (not the live object)', async () => {
    const key = await startSession('t7', 'summary')
    const snapshot = debugActiveSessions()
    expect(snapshot[key]).toBeDefined()
    await stopSessionByKey(key)
    // snapshot must not mutate when live state changes
    expect(snapshot[key]).toBeDefined()
  })
})
