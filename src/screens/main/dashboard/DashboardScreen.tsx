import { Button } from '@/components'
import Container from '@/components/containers/Container'
import SubContainer from '@/components/containers/SubContainer'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/useThemeStore'
import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import TopicCard from '../topic/components/TopicCard/TopicCard'
import DashboardAgentDisplay from './components/DashboardAgentDisplay'
import useDashboard from './hooks/useDashboard'

export default function DashboardScreen() {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.level_five)
  const { items, loading } = useDashboard()

  const styles = createStyles(theme, color)

  return (
    <Container style={styles.container}>
      <SubContainer>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TopicCard item={{ id: item.id, title: item.topicName }} />
          )}
          ListHeaderComponent={<DashboardAgentDisplay />}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {t('dashboard.empty.topics')}
                </Text>
              </View>
            )
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
          textColor={theme.colors.backgroundPrimary}
        />
      </SubContainer>
    </Container>
  )
}

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color || theme.colors.accentRed,
      paddingTop: 0,
    },
    list: { width: '100%', paddingTop: 20 },
    contentContainer: { paddingBottom: 100 },
    emptyContainer: { padding: 16 },
    emptyText: { color: theme.colors.textPrimary },
    button: { alignSelf: 'center', position: 'absolute', bottom: 20 },
  })
