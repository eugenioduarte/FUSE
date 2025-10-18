import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CacheEntry<T> {
  data: T
  updatedAt: number // epoch ms
  version?: string | number
}

const ns = (key: string) => `cache:${key}`

export const localCache = {
  async get<T>(key: string): Promise<CacheEntry<T> | null> {
    const raw = await AsyncStorage.getItem(ns(key))
    if (!raw) return null
    try {
      return JSON.parse(raw) as CacheEntry<T>
    } catch {
      return null
    }
  },
  async set<T>(key: string, data: T, version?: string | number) {
    const entry: CacheEntry<T> = { data, updatedAt: Date.now(), version }
    await AsyncStorage.setItem(ns(key), JSON.stringify(entry))
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(ns(key))
  },
}
