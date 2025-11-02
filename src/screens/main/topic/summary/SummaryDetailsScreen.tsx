import { Button, Container, Text } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import TermSnippetModal from '@/components/ui/TermSnippetModal'
import ExpandableText from '@/components/utils/ExpandableText'
import { useTheme } from '@/hooks/useTheme'
import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { ThemeType } from '@/types/theme.type'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import SummaryDetailsLinksContainer from './components/SummaryDetailsLinksContainer'
import { useSummaryDetails } from './hooks/useSummaryDetails'

const SummaryDetailsScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const route =
    useRoute<RouteProp<RootStackParamList, 'SummaryDetailsScreen'>>()
  const { summaryId } = route.params
  const insets = useSafeAreaInsets()

  const {
    summary,
    loading,
    bg,
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!summary) {
    return (
      <View style={[styles.notFound, { backgroundColor: bg }]}>
        <Text style={styles.notFoundTitle}>Resumo não encontrado</Text>
        <Text style={styles.notFoundId}>ID: {summaryId}</Text>
      </View>
    )
  }

  return (
    <Container style={{ backgroundColor: bg }}>
      <SubContainer>
        <SummaryDetailsLinksContainer
          summary={summary}
          handleDeleteSummary={handleDeleteSummary}
          handleDownload={handleDownload}
        />

        <Text
          variant="xxLarge"
          style={{ marginVertical: theme.spacings.medium }}
        >
          {summary.title || 'Resumo'}
        </Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 80 },
          ]}
          horizontal={false}
        >
          <ExpandableText
            content={summary.content}
            terms={
              summary.expandableTerms ||
              (summary.keywords || []).map((k) => ({ term: k }))
            }
            onPressTerm={openSnippet}
            style={{ color: bodyColor, lineHeight: 20 }}
          />

          {!!summary.recommendations?.length && (
            <View style={styles.recommendationsWrapper}>
              <Text variant="large">Você também pode querer explorar…</Text>

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
          title="Criar challenge"
          style={styles.createButton}
          background={bg}
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

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFound: {
      flex: 1,
      padding: theme.spacings.medium,
    },
    notFoundTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
    },
    notFoundId: {
      color: '#9ca3af',
      marginTop: theme.spacings.small,
    },
    scrollContent: {
      flexGrow: 1,
      width: '100%',
      overflow: 'hidden',
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
      backgroundColor: theme.colors.accentYellow,
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: theme.spacings.small,
    },
  })
