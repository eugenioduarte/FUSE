// Provides a capped-time collaborative flush so UI doesn't hang on slow networks
async function doFlush() {
  try {
    const { processOfflineQueue } = await import('../sync/sync.service')
    await processOfflineQueue()
  } catch {}
  try {
    const { flushLocalCollaborativeChanges } =
      await import('./collab-flush.service')
    await flushLocalCollaborativeChanges()
  } catch {}
}

export async function immediateCollaborativeFlush(timeoutMs = 1500) {
  const result = await Promise.race([
    doFlush().then(() => 'ok' as const),
    new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), timeoutMs),
    ),
  ])
  return result
}
