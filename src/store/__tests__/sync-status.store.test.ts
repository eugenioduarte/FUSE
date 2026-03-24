import { useSyncStatusStore } from '../sync-status.store'

const initialState = useSyncStatusStore.getState()

beforeEach(() => {
  useSyncStatusStore.setState({ ...initialState, status: 'idle' })
})

describe('useSyncStatusStore', () => {
  it('defaults to idle', () => {
    expect(useSyncStatusStore.getState().status).toBe('idle')
  })

  it('setSyncing sets status to syncing', () => {
    useSyncStatusStore.getState().setSyncing()
    expect(useSyncStatusStore.getState().status).toBe('syncing')
  })

  it('setIdle sets status to idle', () => {
    useSyncStatusStore.getState().setSyncing()
    useSyncStatusStore.getState().setIdle()
    expect(useSyncStatusStore.getState().status).toBe('idle')
  })

  it('setError sets status to error', () => {
    useSyncStatusStore.getState().setError()
    expect(useSyncStatusStore.getState().status).toBe('error')
  })

  it('setOffline sets status to offline', () => {
    useSyncStatusStore.getState().setOffline()
    expect(useSyncStatusStore.getState().status).toBe('offline')
  })
})
