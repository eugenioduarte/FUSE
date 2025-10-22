import { Ionicons } from '@expo/vector-icons'
import { RouteProp, useRoute } from '@react-navigation/native'
import * as FileSystem from 'expo-file-system'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import React, { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import TermSnippetModal from '../../../../components/ui/TermSnippetModal'
import ExpandableText from '../../../../components/utils/ExpandableText'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import { aiService } from '../../../../services/ai/ai.service'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { whiteboardRepository } from '../../../../services/repositories/whiteboard.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Summary } from '../../../../types/domain'

const SummaryDetailsScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'SummaryDetailsScreen'>>()
  const { summaryId } = route.params
  useOverlay() // keep overlay store initialized if needed
  const [summary, setSummary] = useState<Summary | null>(
    route.params.summary ?? null,
  )
  const [loading, setLoading] = useState(!route.params.summary)
  const [downloading, setDownloading] = useState(false)
  const [topicName, setTopicName] = useState<string>('')
  const [topicColor, setTopicColor] = useState<string | undefined>()
  const [snippetOpen, setSnippetOpen] = useState(false)
  const [snippetTerm, setSnippetTerm] = useState<
    import('../../../../types/domain').ExpandableTerm | null
  >(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      // If we already have the summary from params, skip fetch
      if (summary) {
        setLoading(false)
        const topic = await topicsRepository.getById(summary.topicId)
        if (active) {
          setTopicName(topic?.title ?? '')
          setTopicColor(topic?.backgroundColor || undefined)
        }
        return
      }
      const found = await summariesRepository.getById(summaryId)
      if (!active) return
      setSummary(found)
      if (found) {
        const topic = await topicsRepository.getById(found.topicId)
        if (active) {
          setTopicName(topic?.title ?? '')
          setTopicColor(topic?.backgroundColor || undefined)
        }
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [summaryId, summary])

  const fileDate = useMemo(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const sanitize = (s: string) =>
    (s || '')
      .normalize('NFD')
      .replaceAll(/[^\p{L}\p{N}\s_-]/gu, '')
      .replaceAll(/\s+/g, '_')
      .replaceAll(/_+/g, '_')
      .replaceAll(/(^_+)|(_+$)/g, '')

  const buildHtml = (tName: string, s: Summary) => {
    const safeTitle = s.title || 'Resumo'
    const contentHtml = (s.content || '')
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replaceAll('\n', '<br/>')}</p>`) // keep single newlines
      .join('\n')
    const keywordsHtml = (s.keywords || [])
      .map((k) => `<span class="chip">${k}</span>`)
      .join(' ')
    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, 'Helvetica Neue', Arial, sans-serif; color:#111; margin:24px; }
    h1 { font-size: 24px; margin: 0 0 4px 0; }
    .meta { color:#555; font-size: 12px; margin-bottom: 16px; }
    .section-title { font-weight:700; margin-top: 16px; }
    p { line-height: 1.5; margin: 8px 0; white-space: normal; }
    .chips { margin-top: 4px; }
    .chip { display:inline-block; border:1px solid #ddd; border-radius:999px; padding:4px 8px; margin-right:6px; color:#444; font-size: 12px; }
  </style>
  <title>${safeTitle}</title>
  </head>
  <body>
    <h1>${safeTitle}</h1>
    <div class="meta">Tópico: ${tName || '-'} • Data: ${fileDate}</div>
    ${s.keywords?.length ? `<div class="section-title">Palavras‑chave</div><div class="chips">${keywordsHtml}</div>` : ''}
    <div class="section-title">Resumo</div>
    ${contentHtml}
  </body>
</html>`
  }

  const handleDownload = async () => {
    if (!summary) return
    if (Platform.OS === 'web') {
      Alert.alert('Não suportado', 'O download em PDF não é suportado no Web.')
      return
    }
    try {
      setDownloading(true)
      const html = buildHtml(topicName, summary)
      const { uri } = await Print.printToFileAsync({ html })
      const topicPart = sanitize(topicName || 'topico')
      const titlePart = sanitize(summary.title || 'resumo')
      const filename = `${topicPart}_${titlePart}_${fileDate}.pdf`
      const targetDir =
        FileSystem.documentDirectory || FileSystem.cacheDirectory || ''
      const targetUri = `${targetDir}${filename}`
      try {
        // Remove if exists
        const info = await FileSystem.getInfoAsync(targetUri)
        if (info.exists) {
          await FileSystem.deleteAsync(targetUri, { idempotent: true })
        }
      } catch {}
      await FileSystem.moveAsync({ from: uri, to: targetUri })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetUri, {
          dialogTitle: 'Compartilhar PDF',
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
        })
      } else {
        Alert.alert('Salvo', `PDF salvo em: ${targetUri}`)
      }
    } catch (e) {
      console.error('PDF download error', e)
      Alert.alert('Erro', 'Não foi possível gerar o PDF deste resumo.')
    } finally {
      setDownloading(false)
    }
  }

  const handleDeleteSummary = async () => {
    if (!summary) return
    Alert.alert(
      'Apagar resumo?',
      'Isto irá apagar o resumo, seus sub-resumos, challenges relacionados e limpar o quadro (whiteboard). Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            ;(async () => {
              try {
                setLoading(true)
                await summariesRepository.deleteById(summary.id)
                await whiteboardRepository.clearAll()
                navigatorManager.goBack()
              } catch (e) {
                console.error(e)
                Alert.alert('Erro', 'Não foi possível apagar o resumo.')
              } finally {
                setLoading(false)
              }
            })()
          },
        },
      ],
    )
  }

  const openSnippet = async (
    term: import('../../../../types/domain').ExpandableTerm,
  ) => {
    if (!summary) return
    // Ensure mini is present; if not, ask AI for a tiny description using summary content as context
    if (term.mini) {
      setSnippetTerm(term)
    } else {
      try {
        const mini = await aiService.miniExplain(term.term, summary.content)
        setSnippetTerm({ ...term, mini })
      } catch {
        setSnippetTerm(term)
      }
    }
    setSnippetOpen(true)
  }

  const createFromTerm = async (
    term: import('../../../../types/domain').ExpandableTerm,
  ) => {
    if (!summary) return
    try {
      setSnippetOpen(false)
      const child = await summariesRepository.createExpandableFromTerm(
        summary,
        term.term,
      )
      navigatorManager.goToSummaryDetails(child.id, child)
    } catch (e) {
      console.error(e)
      Alert.alert('Erro', 'Não foi possível criar o sub-resumo.')
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!summary) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
            Resumo
          </Text>
          {/* If needed, the edit overlay could be invoked with a placeholder; but we need the summary data.
              For now, hide Edit if we couldn't resolve the summary. */}
        </View>
        <Text style={{ color: '#bbb', marginTop: 8 }}>
          Resumo não encontrado.
        </Text>
        <Text style={{ color: '#bbb', marginTop: 4 }}>ID: {summaryId}</Text>
      </View>
    )
  }

  const colored = !!topicColor
  const bg = topicColor || '#0b0b0c'
  const titleColor = colored ? '#111' : 'white'
  const bodyColor = colored ? '#222' : '#ddd'

  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: titleColor, fontSize: 18, fontWeight: '700' }}>
          {summary.title || 'Resumo'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            style={{ marginRight: 16, opacity: downloading ? 0.5 : 1 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="download-outline" size={20} color="#60a5fa" />
              <Text
                style={{ color: '#60a5fa', fontWeight: '700', marginLeft: 6 }}
              >
                {downloading ? 'Gerando…' : 'Baixar PDF'}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteSummary}
            style={{ marginRight: 16 }}
          >
            <Text style={{ color: '#ef4444', fontWeight: '700' }}>Apagar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigatorManager.goToChallengesList({ summaryId })}
          >
            <Text style={{ color: '#60a5fa', fontWeight: '700' }}>
              Ver Challenges →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 12 }} />
      <ScrollView>
        <ExpandableText
          content={summary.content}
          terms={
            summary.expandableTerms ||
            (summary.keywords || []).map((k) => ({ term: k }))
          }
          onPressTerm={openSnippet}
          style={{ color: bodyColor, lineHeight: 20 }}
        />
        {!!summary.keywords?.length && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: titleColor, fontWeight: '700' }}>
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
              {summary.keywords.map((k) => (
                <View
                  key={k}
                  style={{
                    backgroundColor: '#111827',
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

        {!!summary.recommendations?.length && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: titleColor, fontWeight: '700' }}>
              Você também pode querer explorar…
            </Text>
            <View style={{ marginTop: 8 }}>
              {summary.recommendations.map((rec) => (
                <TouchableOpacity
                  key={rec}
                  onPress={() => openSnippet({ term: rec })}
                  style={{ paddingVertical: 8 }}
                >
                  <Text style={{ color: '#60a5fa' }}>• {rec}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={{ height: 12 }} />
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <TouchableOpacity
          onPress={() => navigatorManager.goToWhiteboard()}
          style={{
            backgroundColor: '#0d9488',
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Abrir Whiteboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigatorManager.goToChallengesList({ summaryId })}
          style={{
            backgroundColor: '#111214',
            borderColor: '#2B2C30',
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ color: '#9ca3af', fontWeight: '700' }}>
            Ver challenges deste resumo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Criar challenge
          </Text>
        </TouchableOpacity>
      </View>
      {summary?.parentSummaryId ? (
        <View style={{ position: 'absolute', top: 16, left: 16 }}>
          <TouchableOpacity
            onPress={async () => {
              const parent = await summariesRepository.getById(
                summary.parentSummaryId!,
              )
              if (parent) {
                navigatorManager.goToSummaryDetails(parent.id, parent)
              }
            }}
          >
            <Text style={{ color: '#60a5fa' }}>
              ← Voltar ao resumo anterior
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TermSnippetModal
        visible={snippetOpen}
        term={snippetTerm}
        onClose={() => setSnippetOpen(false)}
        onCreateSummary={createFromTerm}
      />
    </View>
  )
}

export default SummaryDetailsScreen
