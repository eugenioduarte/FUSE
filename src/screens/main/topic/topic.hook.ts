import { useTheme } from '@/hooks/use-theme'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { getDailyTotals } from '@/services/usage/usage-tracker'
import { Topic } from '@/types/domain'
import { useCallback, useEffect, useState } from 'react'

export default function useTopicScreen() {
  const theme = useTheme()

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])
  const [summaryData, setSummaryData] = useState<
    { title: string; value: number; color: string }[]
  >([])

  const buildSummary = useCallback(
    async (list: Topic[]) => {
      try {
        const data = await Promise.all(
          list.map(async (t) => {
            try {
              const totals = await getDailyTotals(t.id)
              const minutes = Object.values(totals).reduce(
                (acc, v) => acc + (Number(v) || 0),
                0,
              )
              const hours = Math.round((minutes / 60) * 10) / 10
              return {
                title: t.title,
                value: hours,
                color: t.backgroundColor || theme.colors.accentBlue,
              }
            } catch {
              return {
                title: t.title,
                value: 0,
                color: t.backgroundColor || theme.colors.accentBlue,
              }
            }
          }),
        )
        setSummaryData(data)
      } catch {
        setSummaryData([])
      }
    },
    [theme.colors.accentBlue],
  )

  const load = useCallback(async () => {
    setLoading(true)
    await topicsRepository.seedIfEmpty()
    const list = await topicsRepository.list()
    setTopics(list)
    await buildSummary(list)
    setLoading(false)
  }, [buildSummary])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const list = await topicsRepository.list()
    setTopics(list)
    await buildSummary(list)
    setRefreshing(false)
  }, [buildSummary])

  useEffect(() => {
    load()
  }, [load])

  return {
    loading,
    refreshing,
    topics,
    summaryData,
    load,
    onRefresh,
  }
}
