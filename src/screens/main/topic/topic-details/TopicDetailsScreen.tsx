import { Button, Container, Text } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import { useTheme } from '@/hooks/useTheme'
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
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'
import { SummaryProgressArcs } from './components/TopicDetailsGraph'
import TopicLinksContainer from './components/TopicLinksContainer'
import TopicNotFounded from './components/TopicNotFounded'
import TopicSummaryCard from './components/TopicSummaryCard'

const TopicDetailsScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const route = useRoute<RouteProp<RootStackParamList, 'TopicDetailsScreen'>>()
  const { topicId } = route.params
  const { setEditOverlay } = useOverlay()
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

  const bgForHeader = topic?.backgroundColor || '#0b0b0c'
  const setBackgroundColor = useThemeStore((s) => s.setBackgroundColor)
  useEffect(() => {
    setBackgroundColor(bgForHeader)
  }, [bgForHeader, setBackgroundColor])
  useFocusEffect(
    useCallback(() => {
      setBackgroundColor(bgForHeader)
    }, [bgForHeader, setBackgroundColor]),
  )

  if (loadingSummaries || loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!topic) {
    return <TopicNotFounded />
  }

  const bg = topic.backgroundColor || theme.colors.backgroundPrimary

  const mockSummaries = [
    {
      title: 'Introdução à História',
      minutes: 42,
      color: theme.colors.accentBlue,
    },
    {
      title: 'Revolução Industrial',
      minutes: 35,
      color: theme.colors.accentYellow,
    },
    {
      title: 'Primeira Guerra Mundial',
      minutes: 25,
      color: theme.colors.accentRed,
    },
    {
      title: 'Segunda Guerra Mundial',
      minutes: 18,
      color: theme.colors.accentGreen,
    },
    {
      title: 'Guerra Fria',
      minutes: 10,
      color: theme.colors.accentPurple,
    },
  ]

  return (
    <Container style={[styles.container, { backgroundColor: bg }]}>
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
        >
          <Text variant="xxLarge">{topic.title}</Text>
          {!!topic.description && (
            <Text variant="large" style={styles.description}>
              {topic.description}
            </Text>
          )}

          <SummaryProgressArcs data={mockSummaries} />

          <Text variant="xxLarge">Summaries</Text>
          <View style={styles.summariesWrapper}>
            {summaries.map((s) => {
              return (
                <TopicSummaryCard
                  key={s.id}
                  summary={s}
                  bg={topic.backgroundColor}
                />
              )
            })}
          </View>
        </ScrollView>
        <Button
          title="Criar resumo"
          onPress={() => navigatorManager.goToSummary({ topicId })}
          background={bg}
          style={styles.createButtonAlign}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicDetailsScreen

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      paddingVertical: theme.spacings.medium,
      paddingBottom: 100,
      width: '100%',
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
