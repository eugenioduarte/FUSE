import { useBottomTabStore } from '@/store/useBottomTabStore'
import { useCallback, useEffect, useState } from 'react'
import { ROUTES } from '../../../../constants/routes'
import { navigationRef } from '../../../../navigation/navigationRef'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useFastwayStore } from '../../../../store/useFastwayStore'
import { useOverlay } from '../../../../store/useOverlay'
import { Challenge, Summary, Topic } from '../../../../types/domain'

export const useFastWayOverlayLogic = () => {
  const { setActiveTab } = useBottomTabStore()
  const { fastWayOverlay, setFastWayOverlay } = useOverlay()
  const fast = useFastwayStore()

  const [topics, setTopics] = useState<Topic[]>([])
  const [summaries, setSummaries] = useState<Record<string, Summary[]>>({})
  const [challengesBySummary, setChallengesBySummary] = useState<
    Record<string, { id: string; title: string }[]>
  >({})
  const [challengeDetailsById, setChallengeDetailsById] = useState<
    Record<string, Challenge>
  >({})
  const [loading, setLoading] = useState(false)
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null)
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(
    null,
  )

  useEffect(() => {
    if (!fastWayOverlay) return
    let mounted = true
    ;(async () => {
      setLoading(true)
      await topicsRepository.seedIfEmpty()
      const list = await topicsRepository.list()
      if (mounted) setTopics(list)
      setLoading(false)
      useFastwayStore.getState().enterDashboard()
    })()
    return () => {
      mounted = false
    }
  }, [fastWayOverlay])

  const fetchSummariesInline = useCallback(async (topicId: string) => {
    setLoading(true)
    const list = await summariesRepository.list(topicId)
    setSummaries((prev) => ({ ...prev, [topicId]: list }))
    setLoading(false)
  }, [])

  const toggleTopicInline = useCallback(
    async (topicId: string) => {
      if (expandedTopicId === topicId) {
        setExpandedTopicId(null)
        setExpandedSummaryId(null)
        return
      }
      setExpandedTopicId(topicId)
      setExpandedSummaryId(null)
      if (!summaries[topicId]) await fetchSummariesInline(topicId)
    },
    [expandedTopicId, fetchSummariesInline, summaries],
  )

  const enterChallengesForSummary = useCallback(
    async (summaryId: string) => {
      setLoading(true)
      fast.enterSummary(summaryId)
      let miniList = challengesBySummary[summaryId]
      if (!miniList) {
        const fetched = await challengesRepository.listBySummary(summaryId)
        setChallengesBySummary((prev) => ({ ...prev, [summaryId]: fetched }))
        miniList = fetched
      }
      // Ensure we have details (including lastAttempt/score) for these challenges
      try {
        const all = await challengesRepository.list()
        const toAdd: Record<string, Challenge> = {}
        for (const mini of miniList || []) {
          const found = all.find((a) => a.id === mini.id)
          if (found) toAdd[found.id] = found
        }
        if (Object.keys(toAdd).length > 0) {
          setChallengeDetailsById((prev) => ({ ...prev, ...toAdd }))
        }
      } catch {}
      setLoading(false)
    },
    [challengesBySummary, fast],
  )

  const toggleSummaryInline = useCallback(
    async (summaryId: string) => {
      if (expandedSummaryId === summaryId) {
        setExpandedSummaryId(null)
        return
      }
      setExpandedSummaryId(summaryId)
      if (!challengesBySummary[summaryId]) {
        setLoading(true)
        const list = await challengesRepository.listBySummary(summaryId)
        setChallengesBySummary((prev) => ({ ...prev, [summaryId]: list }))
        try {
          const all = await challengesRepository.list()
          const toAdd: Record<string, Challenge> = {}
          for (const mini of list) {
            const found = all.find((a) => a.id === mini.id)
            if (found) toAdd[found.id] = found
          }
          if (Object.keys(toAdd).length > 0) {
            setChallengeDetailsById((prev) => ({ ...prev, ...toAdd }))
          }
        } catch {}
        setLoading(false)
      }
    },
    [expandedSummaryId, challengesBySummary],
  )

  const onAddTopic = useCallback(() => {
    setFastWayOverlay(false)
    navigatorManager.goToTopicAdd()
  }, [setFastWayOverlay])

  const onAddSummary = useCallback(() => {
    setFastWayOverlay(false)
    const selectedTopic = topics.find((t) => t.id === fast.selectedTopicId)
    if (selectedTopic?.id)
      navigatorManager.goToSummary({ topicId: selectedTopic.id })
    else navigatorManager.goToSummary()
  }, [fast.selectedTopicId, topics, setFastWayOverlay])

  const onAddChallenge = useCallback(() => {
    setFastWayOverlay(false)
    if (fast.selectedSummaryId)
      navigatorManager.goToChallengeAdd({ summaryId: fast.selectedSummaryId })
    else navigatorManager.goToChallengeAdd()
  }, [fast.selectedSummaryId, setFastWayOverlay])

  const selectedTopic = topics.find((t) => t.id === fast.selectedTopicId)
  const topicSummaries = fast.selectedTopicId
    ? summaries[fast.selectedTopicId] || []
    : []
  const selectedSummary = topicSummaries.find(
    (s) => s.id === fast.selectedSummaryId,
  )
  const selectedChallenge: Challenge | null = fast.selectedChallengeId
    ? (challengeDetailsById[fast.selectedChallengeId] ?? null)
    : null

  const enterChallengeDetails = useCallback(
    async (challengeId: string) => {
      if (!challengeDetailsById[challengeId]) {
        const all = await challengesRepository.list()
        const found = all.find((c) => c.id === challengeId)
        if (found)
          setChallengeDetailsById((p) => ({ ...p, [challengeId]: found }))
      }
      fast.enterChallenge(challengeId)
    },
    [challengeDetailsById, fast],
  )

  const goToTopicsScreen = useCallback(() => {
    setFastWayOverlay(false)
    setActiveTab('topics')
    navigatorManager.goToTopic()
  }, [setFastWayOverlay, setActiveTab])

  const goToSummaryDetails = useCallback(() => {
    if (!fast.selectedSummaryId) return
    setFastWayOverlay(false)
    navigatorManager.goToSummaryDetails(fast.selectedSummaryId, selectedSummary)
  }, [fast.selectedSummaryId, selectedSummary, setFastWayOverlay])

  const goToChallengesListForSummary = useCallback(() => {
    if (!fast.selectedSummaryId) return
    setFastWayOverlay(false)
    navigatorManager.goToChallengesList({ summaryId: fast.selectedSummaryId })
  }, [fast.selectedSummaryId, setFastWayOverlay])

  const isOnDashboard =
    navigationRef.isReady() &&
    navigationRef.getCurrentRoute()?.name === ROUTES.DashboardScreen

  const goToDashboard = useCallback(() => {
    setFastWayOverlay(false)
    setActiveTab('dashboard')
    navigatorManager.goToDashboard()
  }, [setFastWayOverlay, setActiveTab])

  return {
    topics,
    summaries,
    challengesBySummary,
    challengeDetailsById,
    loading,
    expandedTopicId,
    expandedSummaryId,
    toggleTopicInline,
    toggleSummaryInline,
    enterChallengesForSummary,
    enterChallengeDetails,
    onAddTopic,
    onAddSummary,
    onAddChallenge,
    selectedTopic,
    topicSummaries,
    selectedSummary,
    selectedChallenge,
    goToTopicsScreen,
    goToSummaryDetails,
    goToChallengesListForSummary,
    isOnDashboard,
    goToDashboard,
    setFastWayOverlay,
    fast,
    fastWayOverlay,
  }
}
