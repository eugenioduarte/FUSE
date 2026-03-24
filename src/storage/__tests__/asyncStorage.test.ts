import AsyncStorage from '@react-native-async-storage/async-storage'
import { asyncStorage } from '../asyncStorage'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('asyncStorage', () => {
  describe('setItem', () => {
    it('calls AsyncStorage.setItem with the given key and value', async () => {
      await asyncStorage.setItem('my-key', 'my-value')
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('my-key', 'my-value')
    })
  })

  describe('getItem', () => {
    it('returns the stored value', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('stored')
      const result = await asyncStorage.getItem('my-key')
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('my-key')
      expect(result).toBe('stored')
    })

    it('returns null when AsyncStorage returns null', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
      const result = await asyncStorage.getItem('missing')
      expect(result).toBeNull()
    })
  })

  describe('removeItem', () => {
    it('calls AsyncStorage.removeItem with the given key', async () => {
      await asyncStorage.removeItem('my-key')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('my-key')
    })
  })
})
