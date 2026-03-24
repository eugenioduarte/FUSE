import { useNetworkStore } from '../network.store'

const initialState = useNetworkStore.getState()

beforeEach(() => {
  useNetworkStore.setState({ ...initialState, online: true })
})

describe('useNetworkStore', () => {
  it('defaults to online', () => {
    expect(useNetworkStore.getState().online).toBe(true)
  })

  it('setOnline(false) marks as offline', () => {
    useNetworkStore.getState().setOnline(false)
    expect(useNetworkStore.getState().online).toBe(false)
  })

  it('setOnline(true) restores online state', () => {
    useNetworkStore.setState({ online: false })
    useNetworkStore.getState().setOnline(true)
    expect(useNetworkStore.getState().online).toBe(true)
  })
})
