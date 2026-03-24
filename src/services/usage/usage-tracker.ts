import AsyncStorage from '@react-native-async-storage/async-storage'

const STORAGE_KEY = 'study_time_by_topic_v1'
const SESSIONS_KEY = 'study_sessions_v1'

type Totals = Record<string, Record<string, number>> // topicId -> yyyy-mm-dd -> minutes
type SessionRecord = {
  topicId: string
  scope: string
  id?: string
  start: number
  end: number
}

const activeSessions: Record<string, number> = {}

const makeSessionKey = (topicId: string, scope: string, id?: string): string =>
  `${topicId}::${scope}::${id ?? ''}`

export async function startSession(
  topicId: string,
  scope: 'summary' | 'challenge' | 'summary_list' | 'challenge_list',
  id?: string,
): Promise<string> {
  const key = makeSessionKey(topicId, scope, id)
  if (!activeSessions[key]) activeSessions[key] = Date.now()
  return key
}

export async function stopSessionByKey(key: string): Promise<number> {
  const start = activeSessions[key]
  if (!start) return 0
  const durationMs = Date.now() - start
  delete activeSessions[key]
  // convert to minutes, at least 1 minute
  const minutes = Math.max(1, Math.round(durationMs / 60000))
  if (minutes <= 0) return 0

  // topicId is the first segment before '::'
  const topicId = key.split('::')[0]
  const date = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  const end = Date.now()

  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    const totals: Totals = raw ? JSON.parse(raw) : {}
    if (!totals[topicId]) totals[topicId] = {}
    totals[topicId][date] = (totals[topicId][date] || 0) + minutes
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(totals))
    // persist raw session record as well
    try {
      const sessionRaw = await AsyncStorage.getItem(SESSIONS_KEY)
      const sessions: SessionRecord[] = sessionRaw ? JSON.parse(sessionRaw) : []
      const parts = key.split('::')
      const scope = parts[1] || ''
      const id = parts[2] || undefined
      sessions.push({ topicId, scope, id, start, end })
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions))
    } catch (e) {
      console.error('usageTracker: failed to persist session record', e)
    }
  } catch (e) {
    // ignore storage errors but still return minutes
    console.error('usageTracker: failed to persist session', e)
  }

  return minutes
}

export async function stopSession(
  topicId: string,
  scope: 'summary' | 'challenge' | 'summary_list' | 'challenge_list',
  id?: string,
): Promise<number> {
  const key = makeSessionKey(topicId, scope, id)
  return stopSessionByKey(key)
}

export async function getDailyTotals(
  topicId: string,
): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    const totals: Totals = raw ? JSON.parse(raw) : {}
    return totals[topicId] || {}
  } catch (e) {
    console.error('usageTracker: failed to read totals', e)
    return {}
  }
}

export async function getSessions(topicId?: string): Promise<SessionRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY)
    const sessions: SessionRecord[] = raw ? JSON.parse(raw) : []
    if (!topicId) return sessions
    return sessions.filter((s) => s.topicId === topicId)
  } catch (e) {
    console.error('usageTracker: failed to read sessions', e)
    return []
  }
}

export async function clearAllTotals(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export function debugActiveSessions(): Record<string, number> {
  return { ...activeSessions }
}
