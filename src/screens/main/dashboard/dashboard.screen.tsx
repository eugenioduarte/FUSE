import { Button } from '@/components'
import Container from '@/components/containers/container/container'
import EmptyContainer from '@/components/containers/empty-container/empty-container'
import SubContainer from '@/components/containers/sub-container/sub-container'
import SyncIndicator from '@/components/sync-indicator/sync-indicator'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/theme.store'
import { useUpdateBackgroundColor } from '@/hooks/use-update-background-color'
import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import TopicCard from '../topic/components/topic-card/topic-card'
import DashboardAgentDisplay from './components/dashboard-agent-display'
import useDashboard from './dashboard.hook'

export default function DashboardScreen() {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)
  const { items, loading } = useDashboard()

  useUpdateBackgroundColor(
    color === theme.colors.backgroundSecondary
      ? theme.colors.accentYellow
      : color,
  )

  return (
    <Container style={styles.container}>
      <SyncIndicator />
      <SubContainer>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicCard item={{ id: item.id, title: item.topicName }} />
          )}
          ListHeaderComponent={<DashboardAgentDisplay />}
          ListEmptyComponent={
            loading || items.length ? null : <EmptyContainer />
          }
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />

        <Button
          title={t('dashboard.button.create_topic')}
          onPress={() => navigatorManager.goToTopicAdd()}
          style={styles.button}
          background={color}
        />
      </SubContainer>
    </Container>
  )
}

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
      paddingTop: 0,
    },
    list: { width: '100%', paddingTop: theme.spacings.medium },
    contentContainer: { paddingBottom: 100 },
    emptyContainer: { padding: theme.spacings.medium },
    emptyText: { color: theme.colors.textPrimary },
    button: {
      alignSelf: 'center',
      position: 'absolute',
      bottom: theme.spacings.large,
    },
  })
