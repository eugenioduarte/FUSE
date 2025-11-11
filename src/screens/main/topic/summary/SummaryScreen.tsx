import { Button, Container, Text, TextInput } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import PdfTextExtractor from '@/components/utils/PdfTextExtractor'
import { useTheme } from '@/hooks/useTheme'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/useOverlay'
import { Summary } from '@/types/domain'

import { RouteProp, useRoute } from '@react-navigation/native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import React, { useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'

const SummaryScreen = () => {
  const theme = useTheme()
  const { setErrorOverlay, setEditOverlay } = useOverlay()
  const route = useRoute<RouteProp<RootStackParamList, 'SummaryScreen'>>()
  const initialTopicId = route.params?.topicId ?? 'topic-1'
  const initialPrompt = route.params?.seedPrompt ?? ''
  const [topicId] = useState<string>(initialTopicId)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Summary | null>(null)
  const [pdfB64, setPdfB64] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      // call setter directly from the store to avoid stale closures when
      // navigating away while the async op is running
      useOverlay.getState().setLoadingOverlay(true, 'SummaryScreen')
      const summary = await summariesRepository.createWithAI(topicId, prompt)
      // Navigate to details after creation
      setLastSaved(summary)
      navigatorManager.goToSummaryDetails(summary.id, summary)
    } catch (e: any) {
      setErrorOverlay(true, e?.message || 'Falha ao gerar resumo')
    } finally {
      setLoading(false)
      useOverlay.getState().setLoadingOverlay(false)
    }
  }

  const handleImportPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      })
      // @ts-ignore expo types
      if (res.canceled) return
      // @ts-ignore expo types
      const file = res.assets?.[0]
      if (!file?.uri) return
      setExtracting(true)
      const base64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: 'base64',
      })
      setPdfB64(base64)
    } catch {
      console.error('Erro ao importar PDF')
      setErrorOverlay(true, 'Não foi possível importar o PDF.')
      setExtracting(false)
    }
  }

  return (
    <Container style={{ backgroundColor: theme.colors.accentOrange }}>
      <SubContainer styleContainer={{ alignItems: 'flex-start' }}>
        <Text variant="xLarge" style={{ marginVertical: 16 }}>
          Gerar resumo com ChatGPT
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          {!!lastSaved && (
            <TouchableOpacity
              onPress={() =>
                setEditOverlay({
                  type: 'summary',
                  summary: lastSaved,
                  onSaved: (s) => {
                    setLastSaved(s)
                    setTitle(s.title || '')
                    setContent(s.content)
                    setKeywords(s.keywords || [])
                  },
                })
              }
            >
              <Text>Editar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View
          style={{
            flex: 1,
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            onSubmitEditing={handleGenerate}
            placeholder="Descreva o que você quer no resumo..."
            placeholderTextColor={theme.colors.textSecondary}
            multiline
            style={{
              borderWidth: theme.border.size,
              borderColor: theme.colors.borderColor,
              borderRadius: 16,
              padding: 10,
              minHeight: 150,
            }}
            returnKeyType="send"
          />

          <View
            style={{
              alignItems: 'center',
              marginTop: 16,
              marginBottom: 24,
              gap: 16,
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Button
              title="Importar PDF"
              onPress={handleImportPdf}
              disabled={loading || extracting}
              style={{ flex: 1, alignSelf: 'stretch' }}
              background={theme.colors.accentOrange}
            />
            <Button
              title="Gerar"
              onPress={handleGenerate}
              disabled={loading || !prompt.trim()}
              style={{
                flex: 1,
                alignSelf: 'stretch',
              }}
              background={theme.colors.accentOrange}
            />
          </View>

          {!!(title || content) && (
            <ScrollView style={{ flex: 1 }}>
              {!!title && (
                <View
                  style={{
                    alignSelf: 'flex-start',
                    backgroundColor:
                      lastSaved?.backgroundColor || 'transparent',
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      color: lastSaved?.backgroundColor ? '#111' : 'white',
                      fontSize: 16,
                      fontWeight: '700',
                    }}
                  >
                    {title}
                  </Text>
                </View>
              )}
              <View style={{ height: 8 }} />
              <Text
                style={{
                  color: lastSaved?.backgroundColor ? '#222' : '#ddd',
                  lineHeight: 20,
                }}
              >
                {content}
              </Text>
              <View style={{ height: 12 }} />
              {!!keywords.length && (
                <View>
                  <Text style={{ color: 'white', fontWeight: '700' }}>
                    Palavras-chave
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    {keywords.map((k) => (
                      <View
                        key={k}
                        style={{
                          borderColor: '#374151',
                          borderWidth: 1,
                          borderRadius: 999,
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                        }}
                      >
                        <Text style={{ color: '#9ca3af' }}>{k}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {pdfB64 && (
            <PdfTextExtractor
              base64={pdfB64}
              onDone={async (res) => {
                setPdfB64(null)
                if (!res.ok) {
                  setErrorOverlay(true, 'Falha ao ler o PDF.')
                  setExtracting(false)
                  return
                }
                try {
                  // call setter directly from the store to avoid stale closures
                  useOverlay.getState().setLoadingOverlay(true, 'SummaryScreen')
                  const normalized = res.text.replaceAll(/\s+/g, ' ').trim()
                  const truncated = normalized.slice(0, 8000)
                  const summary = await summariesRepository.createWithAI(
                    topicId,
                    truncated,
                  )
                  setLastSaved(summary)
                  navigatorManager.goToSummaryDetails(summary.id, summary)
                } catch {
                  console.error('Erro ao gerar resumo a partir do PDF')
                  setErrorOverlay(
                    true,
                    'Falha ao gerar resumo a partir do PDF.',
                  )
                } finally {
                  useOverlay.getState().setLoadingOverlay(false)
                  setExtracting(false)
                }
              }}
            />
          )}
        </View>
      </SubContainer>
    </Container>
  )
}

export default SummaryScreen
