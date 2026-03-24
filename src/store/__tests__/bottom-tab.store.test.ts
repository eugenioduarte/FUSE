import { useBottomTabStore } from '../bottom-tab.store'

const initialState = useBottomTabStore.getState()

beforeEach(() => {
  useBottomTabStore.setState({ ...initialState })
})

describe('useBottomTabStore', () => {
  it('has dashboard as default active tab', () => {
    expect(useBottomTabStore.getState().activeTab).toBe('dashboard')
  })

  it.each([['dashboard' as const], ['topics' as const], ['calendar' as const]])(
    'setActiveTab sets activeTab to %s',
    (tab) => {
      useBottomTabStore.getState().setActiveTab(tab)
      expect(useBottomTabStore.getState().activeTab).toBe(tab)
    },
  )
})
