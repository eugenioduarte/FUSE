import AsyncStorage from '@react-native-async-storage/async-storage'

export type QueueItem = {
  id: string
  url: string
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  createdAt: number
  tries: number
}

const KEY = 'offline:queue'

async function readQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(KEY)
  return raw ? (JSON.parse(raw) as QueueItem[]) : []
}

async function writeQueue(items: QueueItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items))
}

export const offlineQueue = {
  async enqueue(item: Omit<QueueItem, 'id' | 'createdAt' | 'tries'>) {
    const list = await readQueue()
    const newItem: QueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: Date.now(),
      tries: 0,
    }
    list.push(newItem)
    await writeQueue(list)
    return newItem
  },

  async peekAll() {
    return readQueue()
  },

  async remove(id: string) {
    const list = await readQueue()
    const next = list.filter((q) => q.id !== id)
    await writeQueue(next)
  },

  async bumpTries(id: string) {
    const list = await readQueue()
    const item = list.find((q) => q.id === id)
    if (item) item.tries += 1
    await writeQueue(list)
  },
}
