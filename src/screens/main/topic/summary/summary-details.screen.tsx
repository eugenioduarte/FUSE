import { Button, Container, Text } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/empty-container'
import SubContainer from '@/components/containers/sub-container/sub-container'
import TermSnippetModal from '@/components/term-snippet-modal/term-snippet-modal'
import ExpandableText from '@/components/utils/expandable-text/expandable-text'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigator-manager'
import { useOverlay } from '@/store/overlay.store'
import { useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SummaryDetailsLinksContainer from './components/summary-details-links-container'
import { useSummaryDetails } from './summary-details.hook'

const SummaryDetailsScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const route =
    useRoute<RouteProp<RootStackParamList, 'SummaryDetailsScreen'>>()
  const { summaryId } = route.params
  const insets = useSafeAreaInsets()
  const { setLoadingOverlay } = useOverlay()

  const {
    summary,
    loading,
    bodyColor,
    snippetOpen,
    snippetTerm,
    setSnippetOpen,
    openSnippet,
    createFromTerm,
    handleDownload,
    handleDeleteSummary,
  } = useSummaryDetails({
    summaryId,
    initialSummary: route.params.summary ?? null,
  })

  const styles = createStyles(theme, color, insets.bottom, bodyColor)

  useEffect(() => {
    setLoadingOverlay(loading, t('common.loading'))
    return () => setLoadingOverlay(false)
  }, [loading, setLoadingOverlay])

  if (!summary) {
    return <EmptyContainer />
  }

  return (
    <Container style={styles.container}>
      <SubContainer>
        <SummaryDetailsLinksContainer
          summary={summary}
          handleDeleteSummary={handleDeleteSummary}
          handleDownload={handleDownload}
        />

        <Text variant="xxLarge" style={styles.title}>
          {summary.title || t('summary.default_title')}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          horizontal={false}
        >
          <ExpandableText
            content={summary.content}
            terms={
              summary.expandableTerms ||
              (summary.keywords || []).map((k) => ({ term: k }))
            }
            onPressTerm={openSnippet}
            style={styles.contentText}
          />

          {!!summary.recommendations?.length && (
            <View style={styles.recommendationsWrapper}>
              <Text variant="large">{t('summary.recommendations.title')}</Text>

              <View style={styles.recommendationsList}>
                {summary.recommendations.map((rec) => (
                  <TouchableOpacity
                    key={rec}
                    onPress={() => openSnippet({ term: rec })}
                    style={styles.recommendationItem}
                  >
                    <View style={styles.bullet} />
                    <Text variant="medium" style={styles.recommendationText}>
                      {rec}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <Button
          onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          title={t('summary.create_challenge')}
          style={styles.createButton}
          background={color}
        />

        <TermSnippetModal
          visible={snippetOpen}
          term={snippetTerm}
          onClose={() => setSnippetOpen(false)}
          onCreateSummary={async (term) => {
            const child = await createFromTerm(term)
            if (child) navigatorManager.goToSummaryDetails(child.id, child)
          }}
        />
      </SubContainer>
    </Container>
  )
}

export default SummaryDetailsScreen

const createStyles = (
  theme: ThemeType,
  color: string,
  insetBottom: number,
  bodyColor: string,
) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
    },
    title: {
      marginVertical: theme.spacings.medium,
    },
    contentText: {
      color: bodyColor,
      lineHeight: 20,
    },
    notFound: {
      flex: 1,
      padding: theme.spacings.medium,
    },
    scrollContent: {
      flexGrow: 1,
      width: '100%',
      overflow: 'hidden',
      paddingBottom: insetBottom + 80,
    },
    recommendationsWrapper: {
      marginTop: theme.spacings.medium,
      width: '100%',
    },
    recommendationsList: {
      marginTop: theme.spacings.small,
      width: '100%',
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacings.small,
      width: '100%',
    },
    recommendationText: {
      marginLeft: 6,
      flexShrink: 1,
    },
    createButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
    },
    bullet: {
      backgroundColor: color,
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacings.small,
    },
  })
