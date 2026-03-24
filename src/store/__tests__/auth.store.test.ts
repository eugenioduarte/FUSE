import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../auth.store'

const initialState = useAuthStore.getState()

beforeEach(() => {
  useAuthStore.setState({
    ...initialState,
    user: null,
    rehydrated: false,
    hasShownOnboarding: false,
  })
  jest.clearAllMocks()
})

describe('useAuthStore', () => {
  describe('login', () => {
    it('sets the user on login', () => {
      const user = { id: '1', name: 'Alice', email: 'alice@test.com' }
      useAuthStore.getState().login(user)
      expect(useAuthStore.getState().user).toEqual(user)
    })
  })

  describe('logout', () => {
    it('clears the user and calls AsyncStorage.clear', async () => {
      useAuthStore.setState({
        user: { id: '1', name: 'Alice', email: 'alice@test.com' },
      })
      await useAuthStore.getState().logout()
      expect(useAuthStore.getState().user).toBeNull()
      expect(AsyncStorage.clear).toHaveBeenCalled()
    })
  })

  describe('updateUser', () => {
    it('merges patch into the current user', () => {
      useAuthStore.setState({
        user: { id: '1', name: 'Alice', email: 'alice@test.com' },
      })
      useAuthStore.getState().updateUser({ name: 'Bob' })
      expect(useAuthStore.getState().user).toEqual({
        id: '1',
        name: 'Bob',
        email: 'alice@test.com',
      })
    })

    it('does nothing when user is null', () => {
      useAuthStore.getState().updateUser({ name: 'Bob' })
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('markRehydrated', () => {
    it('sets rehydrated to true', () => {
      expect(useAuthStore.getState().rehydrated).toBe(false)
      useAuthStore.getState().markRehydrated()
      expect(useAuthStore.getState().rehydrated).toBe(true)
    })
  })

  describe('setHasShownOnboarding', () => {
    it('sets hasShownOnboarding flag', () => {
      expect(useAuthStore.getState().hasShownOnboarding).toBe(false)
      useAuthStore.getState().setHasShownOnboarding(true)
      expect(useAuthStore.getState().hasShownOnboarding).toBe(true)
    })

    it('can reset hasShownOnboarding to false', () => {
      useAuthStore.setState({ hasShownOnboarding: true })
      useAuthStore.getState().setHasShownOnboarding(false)
      expect(useAuthStore.getState().hasShownOnboarding).toBe(false)
    })
  })
})
