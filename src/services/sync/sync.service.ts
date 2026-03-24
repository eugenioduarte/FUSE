import { offlineQueue } from '../../storage/offlineQueue'
import { useNetworkStore } from '../../store/network.store'
import { useSyncStatusStore } from '../../store/sync-status.store'

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
    // Discard items with relative URLs — no backend is configured, they will never succeed
    if (!item.url.startsWith('http')) {
      await offlineQueue.remove(item.id)
      continue
    }
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
    }
  }

  useSyncStatusStore.getState()[hasError ? 'setError' : 'setIdle']()
}
