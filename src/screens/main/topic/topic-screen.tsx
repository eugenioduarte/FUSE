import { Button } from '@/components'
import Container from '@/components/containers/container/container'
import LoadingContainer from '@/components/containers/loading-container/loading-container'
import SubContainer from '@/components/containers/sub-container/sub-container'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import TopicCard from './components/TopicCard/topic-card'
import useTopicScreen from './hooks/use-topic-screen'
import { SummaryProgressArcs } from './topic-details/components/topic-details-graph'

const GLOBAL_SEPARATOR = () => <View style={{ height: 8 }} />

const TopicScreen = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)
  const setBackgroundColor = useThemeStore((s) => s.setBackgroundColor)

  const { loading, refreshing, topics, summaryData, onRefresh } =
    useTopicScreen()

  React.useEffect(() => {
    try {
      setBackgroundColor(color)
    } catch {}
  }, [color, setBackgroundColor])

  if (loading) {
    return <LoadingContainer screenName="Topic list" />
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
          ListHeaderComponent={<SummaryProgressArcs data={summaryData} />}
          showsVerticalScrollIndicator={false}
        />

        <Button
          title={t('topicScreen.button.add')}
          onPress={() => navigatorManager.goToTopicAdd()}
          style={styles.createButton}
          background={color}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      backgroundColor: color,
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
  })
