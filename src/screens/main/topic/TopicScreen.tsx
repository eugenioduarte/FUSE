import { Button } from '@/components'
import Container from '@/components/containers/Container'
import SubContainer from '@/components/containers/SubContainer'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useThemeStore } from '@/store/useThemeStore'
import { Topic } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native'
import TopicCard from './components/TopicCard/TopicCard'

const GLOBAL_SEPARATOR = () => <View style={{ height: 8 }} />

const TopicScreen = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const setBackgroundColor = useThemeStore((s) => s.setBackgroundColor)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [topics, setTopics] = useState<Topic[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    await topicsRepository.seedIfEmpty()
    const list = await topicsRepository.list()
    setTopics(list)
    setLoading(false)
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const list = await topicsRepository.list()
    setTopics(list)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useFocusEffect(
    React.useCallback(() => {
      setBackgroundColor(theme.colors.accentGreen)
    }, [setBackgroundColor, theme.colors.accentGreen]),
  )

  useEffect(() => {
    setBackgroundColor(theme.colors.accentGreen)
  }, [setBackgroundColor, theme.colors.accentGreen])

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    )
  }
  return (
    <Container style={styles.container}>
      <SubContainer>
        <FlatList
          data={topics}
          keyExtractor={(t) => t.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ItemSeparatorComponent={GLOBAL_SEPARATOR}
          renderItem={({ item }) => {
            return <TopicCard item={item} />
          }}
          contentContainerStyle={styles.flatContent}
          style={styles.flatStyle}
        />

        <Button
          title={t('topicScreen.button.add')}
          onPress={() => navigatorManager.goToTopicAdd()}
          style={styles.createButton}
          background={theme.colors.accentGreen}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicScreen

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      backgroundColor: theme.colors.accentGreen,
    },
    flatContent: {
      paddingBottom: 80,
    },
    flatStyle: {
      width: '100%',
    },
    createButton: {
      alignSelf: 'center',
      marginTop: theme.spacings.medium,
      position: 'absolute',
      bottom: 20,
    },
    // separator removed; using GLOBAL_SEPARATOR to satisfy linter
  })
