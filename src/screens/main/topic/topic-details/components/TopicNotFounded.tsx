import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const TopicNotFounded = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const topicId = '' // You can replace this with the actual topic ID if available
  return (
    <View style={styles.notFound}>
      <Text style={[styles.notFoundText, { color: theme.colors.textPrimary }]}>
        Tópico não encontrado.
      </Text>
      <Text style={[styles.notFoundText, { color: theme.colors.textPrimary }]}>
        ID: {topicId}
      </Text>
    </View>
  )
}

export default TopicNotFounded

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFound: {
      padding: 16,
    },
    notFoundText: {
      // color provided dynamically
    },
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    titleWrapper: {
      flex: 1,
      marginRight: 12,
    },
    titleText: {
      fontSize: 20,
      fontWeight: '700',
    },
    editText: {
      color: '#2563eb',
      fontWeight: '700',
    },
    actionMargin: {
      marginLeft: 12,
    },
    shareText: {
      color: '#10b981',
      fontWeight: '700',
    },
    rankingText: {
      color: '#f59e0b',
      fontWeight: '700',
    },
    chatText: {
      color: '#22c55e',
      fontWeight: '700',
    },
    deleteText: {
      color: '#ef4444',
      fontWeight: '700',
    },
    sharePanel: {
      marginTop: 12,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    shareHeading: {
      fontWeight: '800',
      marginBottom: 10,
    },
    connectionsList: {
      gap: 10,
    },
    connectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    nameContainer: {
      flex: 1,
      marginRight: 12,
    },
    nameText: {
      fontWeight: '700',
    },
    emailText: {},
    inviteButton: {
      backgroundColor: '#2563eb',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    inviteButtonText: {
      color: 'white',
      fontWeight: '700',
    },
    spacer20: {
      height: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    loadingSummaries: {
      paddingVertical: 16,
    },
    emptyText: {
      marginTop: 8,
    },
    summariesList: {
      marginTop: 8,
    },
    summaryCard: {
      borderRadius: 10,
      padding: 12,
      borderColor: '#2f2f31',
      borderWidth: 1,
      marginBottom: 10,
    },
    summaryTitle: {
      fontWeight: '700',
      marginBottom: 6,
    },
    summarySnippet: {},
    createSummaryContainer: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 16,
    },
    createSummaryButton: {
      backgroundColor: '#3b82f6',
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
    },
    createSummaryButtonText: {
      color: 'white',
      fontWeight: '700',
    },
  })
