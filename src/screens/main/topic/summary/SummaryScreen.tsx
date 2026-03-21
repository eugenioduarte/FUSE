import { Button, Container, Text, TextInput } from '@/components'
import SubContainer from '@/components/containers/sub-container/SubContainer'
import PdfTextExtractor from '@/components/utils/pdf-text-extractor/PdfTextExtractor'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { RootStackParamList } from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import useSummaryScreen from './useSummaryScreen'

const SummaryScreen = () => {
  const theme = useTheme()
  const route = useRoute<RouteProp<RootStackParamList, 'SummaryScreen'>>()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const initialTopicId = route.params?.topicId ?? 'topic-1'
  const initialPrompt = route.params?.seedPrompt ?? ''
  const {
    prompt,
    setPrompt,
    loading,
    extracting,
    pdfB64,
    handleGenerate,
    handleImportPdf,
    handlePdfDone,
  } = useSummaryScreen(initialTopicId, initialPrompt)

  return (
    <Container style={styles.container}>
      <SubContainer styleContainer={styles.subContainer}>
        <Text variant="xLarge" style={styles.title}>
          {t('summaryScreen.title')}
        </Text>

        <View style={styles.mainWrapper}>
          {!extracting && !pdfB64 && (
            <TextInput
              value={prompt}
              onChangeText={setPrompt}
              onSubmitEditing={handleGenerate}
              placeholder={t('summaryScreen.placeholder')}
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={styles.promptInput}
              returnKeyType="send"
            />
          )}

          <View style={styles.buttonRow}>
            <Button
              title={t('summaryScreen.button.import_pdf')}
              onPress={handleImportPdf}
              disabled={loading || extracting}
              style={styles.button}
              background={color}
            />
            <Button
              title={t('summaryScreen.button.generate')}
              onPress={handleGenerate}
              disabled={loading || !prompt.trim()}
              style={styles.button}
              background={color}
            />
          </View>

          {pdfB64 && (
            <PdfTextExtractor
              base64={pdfB64}
              onDone={(res) => void handlePdfDone(res)}
            />
          )}
        </View>
      </SubContainer>
    </Container>
  )
}

export default SummaryScreen

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
      paddingTop: 0,
    },
    subContainer: {
      alignItems: 'flex-start',
    },
    title: {
      marginVertical: 16,
    },
    mainWrapper: {
      flex: 1,
      width: '100%',
      justifyContent: 'space-between',
    },
    promptInput: {
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderRadius: 16,
      padding: 10,
      minHeight: '40%',
      backgroundColor: theme.colors.backgroundPrimary,
    },
    buttonRow: {
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 24,
      gap: 16,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    button: {
      flex: 1,
      alignSelf: 'stretch',
    },
  })
