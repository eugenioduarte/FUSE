import type { Summary, Topic } from '../../types/domain'
import { useOverlay } from '../overlay.store'

const initialState = useOverlay.getState()

beforeEach(() => {
  useOverlay.setState({
    ...initialState,
    errorOverlay: false,
    fastWayOverlay: false,
    loadingOverlay: false,
    loadingMessage: undefined,
    errorMessage: undefined,
    successOverlay: false,
    successMessage: undefined,
    editOverlay: null,
    notificationOverlay: null,
    shareOverlay: null,
    rankingOverlay: null,
  })
})

const mockTopic: Topic = {
  id: 't1',
  title: 'Test Topic',
  createdAt: 1000,
  updatedAt: 1000,
}

const mockSummary: Summary = {
  id: 's1',
  topicId: 't1',
  content: 'content',
  generatedBy: 'user',
  createdAt: 1000,
  updatedAt: 1000,
}

describe('useOverlay', () => {
  describe('setErrorOverlay', () => {
    it('shows error overlay with message', () => {
      useOverlay.getState().setErrorOverlay(true, 'Something failed')
      expect(useOverlay.getState().errorOverlay).toBe(true)
      expect(useOverlay.getState().errorMessage).toBe('Something failed')
    })

    it('hides error overlay', () => {
      useOverlay.getState().setErrorOverlay(true)
      useOverlay.getState().setErrorOverlay(false)
      expect(useOverlay.getState().errorOverlay).toBe(false)
    })
  })

  describe('setFastWayOverlay', () => {
    it('toggles fastway overlay', () => {
      useOverlay.getState().setFastWayOverlay(true)
      expect(useOverlay.getState().fastWayOverlay).toBe(true)
      useOverlay.getState().setFastWayOverlay(false)
      expect(useOverlay.getState().fastWayOverlay).toBe(false)
    })
  })

  describe('setLoadingOverlay', () => {
    it('shows loading with optional message', () => {
      useOverlay.getState().setLoadingOverlay(true, 'Loading...')
      expect(useOverlay.getState().loadingOverlay).toBe(true)
      expect(useOverlay.getState().loadingMessage).toBe('Loading...')
    })

    it('hides loading overlay', () => {
      useOverlay.getState().setLoadingOverlay(true)
      useOverlay.getState().setLoadingOverlay(false)
      expect(useOverlay.getState().loadingOverlay).toBe(false)
    })
  })

  describe('setSuccessOverlay', () => {
    it('shows success overlay with message', () => {
      useOverlay.getState().setSuccessOverlay(true, 'Done!')
      expect(useOverlay.getState().successOverlay).toBe(true)
      expect(useOverlay.getState().successMessage).toBe('Done!')
    })
  })

  describe('setEditOverlay', () => {
    it('sets a topic edit payload', () => {
      useOverlay.getState().setEditOverlay({ type: 'topic', topic: mockTopic })
      const edit = useOverlay.getState().editOverlay
      expect(edit?.type).toBe('topic')
    })

    it('sets a summary edit payload', () => {
      useOverlay
        .getState()
        .setEditOverlay({ type: 'summary', summary: mockSummary })
      const edit = useOverlay.getState().editOverlay
      expect(edit?.type).toBe('summary')
    })

    it('clears the edit overlay with null', () => {
      useOverlay.getState().setEditOverlay({ type: 'topic', topic: mockTopic })
      useOverlay.getState().setEditOverlay(null)
      expect(useOverlay.getState().editOverlay).toBeNull()
    })
  })

  describe('setNotificationOverlay', () => {
    it('sets a notification payload', () => {
      const payload = {
        id: 'n1',
        title: 'New invite',
        body: 'You have an invite',
      }
      useOverlay.getState().setNotificationOverlay(payload)
      expect(useOverlay.getState().notificationOverlay).toEqual(payload)
    })

    it('clears notification overlay with null', () => {
      useOverlay.getState().setNotificationOverlay({ id: 'n1' })
      useOverlay.getState().setNotificationOverlay(null)
      expect(useOverlay.getState().notificationOverlay).toBeNull()
    })
  })

  describe('setShareOverlay', () => {
    it('sets the share overlay payload', () => {
      const payload = { id: 'sh1', topicId: 't1', connections: [] }
      useOverlay.getState().setShareOverlay(payload)
      expect(useOverlay.getState().shareOverlay).toEqual(payload)
    })

    it('clears with null', () => {
      useOverlay
        .getState()
        .setShareOverlay({ id: 'sh1', topicId: 't1', connections: [] })
      useOverlay.getState().setShareOverlay(null)
      expect(useOverlay.getState().shareOverlay).toBeNull()
    })
  })

  describe('setRankingOverlay', () => {
    it('sets the ranking overlay payload', () => {
      const payload = { id: 'r1', topicId: 't1' }
      useOverlay.getState().setRankingOverlay(payload)
      expect(useOverlay.getState().rankingOverlay).toEqual(payload)
    })

    it('clears with null', () => {
      useOverlay.getState().setRankingOverlay({ id: 'r1', topicId: 't1' })
      useOverlay.getState().setRankingOverlay(null)
      expect(useOverlay.getState().rankingOverlay).toBeNull()
    })
  })
})
