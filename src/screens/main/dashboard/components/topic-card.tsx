import DisplayNumber from '@/components/display-number/display-number'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { FlatList, Image, StyleSheet, View } from 'react-native'
import { Card, Text } from '../../../../components'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { TopicCardChart } from './topic-card-chart'

type User = {
  id: string
  name: string
  avatarUrl: string
}

export type TopicCardPayload = {
  id: string
  topicName: string
  score?: number
  usersShared?: User[]
  summaries?: { id: string; title?: string }[]
  backgroundColor?: string
}

const TopicCard: React.FC<TopicCardPayload> = ({
  id,
  topicName,
  score,
  usersShared,
  summaries,
  backgroundColor,
}) => {
  const theme = useTheme()
  const styles = createStyles(theme, backgroundColor)

  const handlePress = () => navigatorManager.goToTopicDetails(id)

  return (
    <Card style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text variant="large">{topicName}</Text>
        {!!summaries && (
          <View style={styles.summariesBadge}>
            <Text>{summaries.length}</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        {!!score && (
          <DisplayNumber
            value={score}
            label={t('topicCard.label.scores')}
            backgroundColor={backgroundColor}
          />
        )}

        <View>
          {!!usersShared?.length && (
            <FlatList
              data={usersShared}
              keyExtractor={(item) => item.id}
              horizontal
              contentContainerStyle={styles.avatarsContainer}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.avatarWrap,
                    index > 0 ? styles.avatarOverlap : undefined,
                    { borderColor: backgroundColor },
                  ]}
                >
                  <Image
                    source={{ uri: item.avatarUrl }}
                    style={styles.avatar}
                  />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <TopicCardChart backgroundColor={backgroundColor} />
    </Card>
  )
}

export default TopicCard

const createStyles = (theme: ThemeType, backgroundColor?: string) =>
  StyleSheet.create({
    card: {
      marginBottom: 8,
      backgroundColor: theme.colors.backgroundSecondary,
      paddingBottom: theme.spacings.small,
      width: '100%',
    },
    header: {
      marginBottom: 8,
      backgroundColor: backgroundColor || theme.colors.accentYellow,
      padding: theme.spacings.medium,
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleColor: { color: backgroundColor ? '#111' : theme.colors.textPrimary },
    summariesBadge: {
      width: theme.spacings.xLarge,
      height: theme.spacings.xLarge,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.border.radius16,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacings.medium,
      marginBottom: theme.spacings.medium,
    },
    avatarsContainer: {
      gap: theme.spacings.small,
      marginTop: theme.spacings.xSmall,
    },
    avatarWrap: {
      borderWidth: theme.border.size,
      borderRadius: 999,
    },
    avatarOverlap: {
      marginLeft: -(theme.spacings.large - theme.spacings.xSmall),
    },
    avatar: {
      width: theme.spacings.xLarge + theme.spacings.xSmall,
      height: theme.spacings.xLarge + theme.spacings.xSmall,
      borderRadius: (theme.spacings.xLarge + theme.spacings.xSmall) / 2,
    },
  })
