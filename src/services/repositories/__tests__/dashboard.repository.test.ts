import { localCache } from '../../../storage/localCache'
import { dashboardRepository } from '../dashboard.repository'

jest.mock('../../../storage/localCache', () => ({
  localCache: {
    get: jest.fn(),
    set: jest.fn(),
  },
}))

const mockGet = localCache.get as jest.Mock
const mockSet = localCache.set as jest.Mock

beforeEach(() => {
  jest.clearAllMocks()
})

describe('dashboardRepository', () => {
  describe('listTopicCards', () => {
    it('returns cached data when cache is populated', async () => {
      const cards = [{ id: 't1', title: 'Algebra' }]
      mockGet.mockResolvedValueOnce({ data: cards, updatedAt: 1000 })
      const result = await dashboardRepository.listTopicCards()
      expect(result).toEqual(cards)
      expect(mockGet).toHaveBeenCalledWith('dashboard:topic-cards')
    })

    it('returns empty array when cache is empty', async () => {
      mockGet.mockResolvedValueOnce(null)
      const result = await dashboardRepository.listTopicCards()
      expect(result).toEqual([])
    })

    it('returns empty array when cached data array is empty', async () => {
      mockGet.mockResolvedValueOnce({ data: [], updatedAt: 1000 })
      const result = await dashboardRepository.listTopicCards()
      expect(result).toEqual([])
    })
  })

  describe('seedTopicCardsIfEmpty', () => {
    it('is a no-op and never writes to cache', async () => {
      await dashboardRepository.seedTopicCardsIfEmpty()
      expect(mockSet).not.toHaveBeenCalled()
    })

    it('is a no-op even when cache is null', async () => {
      mockGet.mockResolvedValueOnce(null)
      await dashboardRepository.seedTopicCardsIfEmpty()
      expect(mockSet).not.toHaveBeenCalled()
    })
  })
})
