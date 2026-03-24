import { offlineQueue } from '../offlineQueue'

jest.mock('@/lib/db/db', () => ({
  getDb: jest.fn().mockResolvedValue({}),
}))

const mockEnqueue = jest.fn()
const mockPeekAll = jest.fn()
const mockRemove = jest.fn()
const mockBumpTries = jest.fn()

jest.mock('@/lib/db/dao/offline-queue.dao', () => ({
  offlineQueueDao: {
    enqueue: (...args: any[]) => mockEnqueue(...args),
    peekAll: (...args: any[]) => mockPeekAll(...args),
    remove: (...args: any[]) => mockRemove(...args),
    bumpTries: (...args: any[]) => mockBumpTries(...args),
  },
}))

const baseItem = {
  url: 'https://api.test/endpoint',
  method: 'POST' as const,
  body: { hello: 'world' },
  headers: { Authorization: 'Bearer token' },
}

const fullItem = { ...baseItem, id: 'id-1', createdAt: 1000, tries: 0 }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('offlineQueue', () => {
  describe('enqueue', () => {
    it('delegates to offlineQueueDao.enqueue with the db and item', async () => {
      mockEnqueue.mockResolvedValueOnce(fullItem)
      const result = await offlineQueue.enqueue(baseItem)
      expect(mockEnqueue).toHaveBeenCalledWith(expect.anything(), baseItem)
      expect(result).toEqual(fullItem)
    })
  })

  describe('peekAll', () => {
    it('returns all items from the dao', async () => {
      mockPeekAll.mockResolvedValueOnce([fullItem])
      const result = await offlineQueue.peekAll()
      expect(mockPeekAll).toHaveBeenCalledWith(expect.anything())
      expect(result).toEqual([fullItem])
    })

    it('returns empty array when queue is empty', async () => {
      mockPeekAll.mockResolvedValueOnce([])
      const result = await offlineQueue.peekAll()
      expect(result).toEqual([])
    })
  })

  describe('remove', () => {
    it('delegates to offlineQueueDao.remove with the db and id', async () => {
      mockRemove.mockResolvedValueOnce(undefined)
      await offlineQueue.remove('id-1')
      expect(mockRemove).toHaveBeenCalledWith(expect.anything(), 'id-1')
    })
  })

  describe('bumpTries', () => {
    it('delegates to offlineQueueDao.bumpTries with the db and id', async () => {
      mockBumpTries.mockResolvedValueOnce(undefined)
      await offlineQueue.bumpTries('id-1')
      expect(mockBumpTries).toHaveBeenCalledWith(expect.anything(), 'id-1')
    })
  })
})
