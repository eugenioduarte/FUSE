import { create } from 'zustand'
// Domain types aren't needed directly here; state holds only IDs

type Level = 'dashboard' | 'topic' | 'summary' | 'challenge'

interface FastwayState {
  level: Level
  selectedTopicId: string | null
  selectedSummaryId: string | null
  selectedChallengeId: string | null

  // Derived setters
  enterDashboard: () => void
  enterTopic: (topicId: string) => void
  enterSummary: (summaryId: string, topicId?: string) => void
  enterChallenge: (challengeId: string) => void

  // Back actions
  backFromTopic: () => void
  backFromSummary: () => void
  backFromChallenge: () => void

  // Reset when closing modal
  reset: () => void
}

export const useFastwayStore = create<FastwayState>((set, get) => ({
  level: 'dashboard',
  selectedTopicId: null,
  selectedSummaryId: null,
  selectedChallengeId: null,

  enterDashboard: () =>
    set({
      level: 'dashboard',
      selectedTopicId: null,
      selectedSummaryId: null,
      selectedChallengeId: null,
    }),
  enterTopic: (topicId) =>
    set({
      level: 'topic',
      selectedTopicId: topicId,
      selectedSummaryId: null,
      selectedChallengeId: null,
    }),
  enterSummary: (summaryId, topicId) =>
    set((s) => ({
      level: 'summary',
      selectedTopicId: topicId ?? s.selectedTopicId,
      selectedSummaryId: summaryId,
      selectedChallengeId: null,
    })),
  enterChallenge: (challengeId) =>
    set({ level: 'challenge', selectedChallengeId: challengeId }),

  backFromTopic: () => set({ level: 'dashboard', selectedTopicId: null }),
  backFromSummary: () => set({ level: 'topic', selectedSummaryId: null }),
  backFromChallenge: () => set({ level: 'summary', selectedChallengeId: null }),

  reset: () =>
    set({
      level: 'dashboard',
      selectedTopicId: null,
      selectedSummaryId: null,
      selectedChallengeId: null,
    }),
}))
