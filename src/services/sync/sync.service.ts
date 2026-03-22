import { offlineQueue } from '../../storage/offlineQueue'
import { useNetworkStore } from '../../store/useNetworkStore'
import { useSyncStatusStore } from '../../store/useSyncStatusStore'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export async function processOfflineQueue() {
  const online = useNetworkStore.getState().online

  if (!online) {
    useSyncStatusStore.getState().setOffline()
    return
  }

  const items = await offlineQueue.peekAll()
  if (items.length === 0) {
    useSyncStatusStore.getState().setIdle()
    return
  }

  useSyncStatusStore.getState().setSyncing()

  let hasError = false
  for (const item of items) {
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: item.headers
          ? { 'Content-Type': 'application/json', ...item.headers }
          : { 'Content-Type': 'application/json' },
        body: item.body ? JSON.stringify(item.body) : undefined,
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await offlineQueue.remove(item.id)
    } catch {
      hasError = true
      await offlineQueue.bumpTries(item.id)
      const tries = (item.tries || 0) + 1
      const backoff = Math.min(30_000, 1000 * Math.pow(2, tries))
      await sleep(backoff)
    }
  }

  useSyncStatusStore.getState()[hasError ? 'setError' : 'setIdle']()
}
