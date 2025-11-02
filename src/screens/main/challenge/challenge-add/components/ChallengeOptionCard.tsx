import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

const ChallengeOptionCard = ({
  label,
  onPress,
  score,
  total,
}: {
  label: string
  onPress: () => void
  score: number
  total: number
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{
        color: theme.colors.accentYellow,
        borderless: false,
        radius: 150,
      }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text variant="large" style={styles.headerText}>
          {label}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.badge}>
          <Text variant="medium" style={styles.badgeLabel}>
            {t('challenge.card.challenges_label')}:{' '}
          </Text>
          <Text variant="medium" style={styles.badgeValue}>
            {total}
          </Text>
        </View>

        {score > 0 ? (
          <View style={styles.scoreRow}>
            <Text style={styles.score}>{score}</Text>
            <Text variant="medium" style={styles.percent}>
              %
            </Text>
          </View>
        ) : (
          <Text variant="medium" style={styles.noScore}>
            {t('challenge.card.no_score')}
          </Text>
        )}
      </View>
    </Pressable>
  )
}

export default ChallengeOptionCard

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    card: {
      flexBasis: '48%',
      height: 200,
      borderRadius: theme.border.radius16,
      overflow: 'hidden',
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      marginBottom: theme.spacings.small,
      shadowColor: theme.colors.black,
      elevation: 2,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    header: {
      backgroundColor: theme.colors.backgroundTertiary,
      height: 48,
      justifyContent: 'center',
      paddingHorizontal: theme.spacings.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.borderColor,
    },
    headerText: {
      color: theme.colors.textPrimary,
      fontFamily: theme.typography.large.fontFamily,
      fontSize: theme.typography.large.fontSize + 1,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacings.medium,
      paddingTop: theme.spacings.large,
    },
    badge: {
      position: 'absolute',
      top: theme.spacings.xSmall,
      left: theme.spacings.xSmall,
      flexDirection: 'row',
      backgroundColor: theme.colors.accentYellow,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 16,
    },
    badgeLabel: {
      color: theme.colors.textPrimary,
    },
    badgeValue: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    score: {
      fontSize: 64,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      lineHeight: 68,
      textShadowColor: 'rgba(0,0,0,0.15)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    percent: {
      marginLeft: 4,
      marginBottom: 4,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      fontSize: 20,
    },
    noScore: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
      lineHeight: 20,
      paddingHorizontal: 6,
    },
  })
