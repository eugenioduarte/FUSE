import { useFastwayStore } from '../fastway.store'

const initialState = useFastwayStore.getState()

beforeEach(() => {
  useFastwayStore.setState({ ...initialState })
  useFastwayStore.getState().reset()
})

describe('useFastwayStore', () => {
  it('starts at dashboard level with all ids null', () => {
    const s = useFastwayStore.getState()
    expect(s.level).toBe('dashboard')
    expect(s.selectedTopicId).toBeNull()
    expect(s.selectedSummaryId).toBeNull()
    expect(s.selectedChallengeId).toBeNull()
  })

  describe('enterTopic', () => {
    it('sets level to topic and stores topicId', () => {
      useFastwayStore.getState().enterTopic('t1')
      const s = useFastwayStore.getState()
      expect(s.level).toBe('topic')
      expect(s.selectedTopicId).toBe('t1')
      expect(s.selectedSummaryId).toBeNull()
    })
  })

  describe('enterSummary', () => {
    it('sets level to summary with summaryId and optional topicId', () => {
      useFastwayStore.getState().enterSummary('s1', 't1')
      const s = useFastwayStore.getState()
      expect(s.level).toBe('summary')
      expect(s.selectedSummaryId).toBe('s1')
      expect(s.selectedTopicId).toBe('t1')
    })

    it('preserves existing topicId when not passed', () => {
      useFastwayStore.getState().enterTopic('t2')
      useFastwayStore.getState().enterSummary('s1')
      expect(useFastwayStore.getState().selectedTopicId).toBe('t2')
    })
  })

  describe('enterChallenge', () => {
    it('sets level to challenge and stores challengeId', () => {
      useFastwayStore.getState().enterChallenge('c1')
      const s = useFastwayStore.getState()
      expect(s.level).toBe('challenge')
      expect(s.selectedChallengeId).toBe('c1')
    })
  })

  describe('enterDashboard', () => {
    it('resets to dashboard clearing all ids', () => {
      useFastwayStore.getState().enterTopic('t1')
      useFastwayStore.getState().enterDashboard()
      const s = useFastwayStore.getState()
      expect(s.level).toBe('dashboard')
      expect(s.selectedTopicId).toBeNull()
    })
  })

  describe('back actions', () => {
    it('backFromTopic goes to dashboard and clears topicId', () => {
      useFastwayStore.getState().enterTopic('t1')
      useFastwayStore.getState().backFromTopic()
      const s = useFastwayStore.getState()
      expect(s.level).toBe('dashboard')
      expect(s.selectedTopicId).toBeNull()
    })

    it('backFromSummary goes to topic and clears summaryId', () => {
      useFastwayStore.getState().enterSummary('s1', 't1')
      useFastwayStore.getState().backFromSummary()
      const s = useFastwayStore.getState()
      expect(s.level).toBe('topic')
      expect(s.selectedSummaryId).toBeNull()
    })

    it('backFromChallenge goes to summary and clears challengeId', () => {
      useFastwayStore.getState().enterChallenge('c1')
      useFastwayStore.getState().backFromChallenge()
      const s = useFastwayStore.getState()
      expect(s.level).toBe('summary')
      expect(s.selectedChallengeId).toBeNull()
    })
  })

  describe('reset', () => {
    it('resets all state back to initial dashboard', () => {
      useFastwayStore.getState().enterChallenge('c1')
      useFastwayStore.getState().reset()
      const s = useFastwayStore.getState()
      expect(s.level).toBe('dashboard')
      expect(s.selectedTopicId).toBeNull()
      expect(s.selectedSummaryId).toBeNull()
      expect(s.selectedChallengeId).toBeNull()
    })
  })
})
