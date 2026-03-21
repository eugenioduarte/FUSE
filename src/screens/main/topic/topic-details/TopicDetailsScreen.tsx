import { Button, Container, Text } from '@/components'
import SubContainer from '@/components/containers/sub-container/SubContainer'
import { useTheme } from '@/hooks/use-theme'
import useTrackTopicSession from '@/hooks/use-track-topic-session'
import { t } from '@/locales/translation'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { listAcceptedConnections } from '@/services/firebase/connections.service'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { Summary, Topic } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useFocusEffect, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import TopicLinksContainer from './components/TopicLinksContainer'
import TopicSummaryCard from './components/TopicSummaryCard'

const TopicDetailsScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)
  const route = useRoute<RouteProp<RootStackParamList, 'TopicDetailsScreen'>>()
  const { topicId } = route.params
  const { setEditOverlay, setLoadingOverlay } = useOverlay()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [loadingSummaries, setLoadingSummaries] = useState(false)

  const [connections, setConnections] = useState<
    {
      uid: string
      name: string | null
      email: string | null
      avatarUrl: string | null
    }[]
  >([])
  const myUid = useAuthStore((s) => s.user?.id ?? null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      await topicsRepository.seedIfEmpty()
      const t = await topicsRepository.getById(topicId)
      if (mounted) setTopic(t)
      if (mounted) setLoading(false)
    })()
    return () => {
      mounted = false
    }
  }, [topicId])

  useTrackTopicSession(topicId, 'summary_list')

  useFocusEffect(
    useCallback(() => {
      let active = true
      ;(async () => {
        setLoadingSummaries(true)
        const list = await summariesRepository.list(topicId)
        if (active) setSummaries(list)
        if (active) setLoadingSummaries(false)
      })()
      return () => {
        active = false
      }
    }, [topicId]),
  )

  useEffect(() => {
    const isLoading = loading || loadingSummaries
    setLoadingOverlay(isLoading, t('common.loading'))
    return () => {
      setLoadingOverlay(false)
    }
  }, [loading, loadingSummaries, setLoadingOverlay])

  if (!topic) {
    return null
  }

  return (
    <Container style={[styles.container, { backgroundColor: color }]}>
      <SubContainer>
        <TopicLinksContainer
          topicId={topicId}
          topic={topic}
          myUid={myUid}
          connections={connections}
          setConnections={setConnections}
          setEditOverlay={setEditOverlay}
          setTopic={setTopic}
          listAcceptedConnections={listAcceptedConnections}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          style={{ width: '100%' }}
        >
          <Text variant="xxLarge">{topic.title}</Text>
          {!!topic.description && (
            <Text variant="large" style={styles.description}>
              {topic.description}
            </Text>
          )}

          {summaries.length > 0 && (
            <View style={styles.summariesWrapper}>
              {summaries.map((s) => {
                return <TopicSummaryCard key={s.id} summary={s} bg={color} />
              })}
            </View>
          )}
        </ScrollView>
        <Button
          title={t('topicDetails.create_summary')}
          onPress={() => navigatorManager.goToSummary({ topicId })}
          background={color}
          style={styles.createButtonAlign}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicDetailsScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: theme.spacings.medium,
      paddingBottom: 100,
      width: '100%',
      alignItems: 'flex-start',
    },
    description: {
      marginTop: theme.spacings.small,
    },
    summariesWrapper: {
      marginTop: theme.spacings.small,
      width: '100%',
    },
    createButtonAlign: {
      alignSelf: 'center',
      position: 'absolute',
      bottom: 20,
    },
  })
