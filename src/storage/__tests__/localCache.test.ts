import AsyncStorage from '@react-native-async-storage/async-storage'
import { localCache } from '../localCache'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('localCache', () => {
  describe('set', () => {
    it('serialises the entry under the cache: namespace', async () => {
      const before = Date.now()
      await localCache.set('topics', [{ id: '1' }])
      const [key, raw] = (AsyncStorage.setItem as jest.Mock).mock.calls[0] as [
        string,
        string,
      ]
      expect(key).toBe('cache:topics')
      const parsed = JSON.parse(raw)
      expect(parsed.data).toEqual([{ id: '1' }])
      expect(parsed.updatedAt).toBeGreaterThanOrEqual(before)
      expect(parsed.version).toBeUndefined()
    })

    it('includes version when provided', async () => {
      await localCache.set('topics', [], '2')
      const raw = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1] as string
      expect(JSON.parse(raw).version).toBe('2')
    })
  })

  describe('get', () => {
    it('returns the parsed entry when present', async () => {
      const entry = { data: { name: 'Alice' }, updatedAt: 1000 }
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        JSON.stringify(entry),
      )
      const result = await localCache.get<{ name: string }>('user')
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('cache:user')
      expect(result).toEqual(entry)
    })

    it('returns null when key is not found', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null)
      const result = await localCache.get('missing')
      expect(result).toBeNull()
    })

    it('returns null when stored value is corrupted JSON', async () => {
      ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('NOT_JSON')
      const result = await localCache.get('corrupted')
      expect(result).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes the namespaced key', async () => {
      await localCache.remove('topics')
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('cache:topics')
    })
  })
})
