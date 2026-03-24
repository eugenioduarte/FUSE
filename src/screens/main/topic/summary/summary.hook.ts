import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useOverlay } from '@/store/overlay.store'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { useState } from 'react'

type PdfResult = { ok: true; text: string } | { ok: false; error: string }

type UseSummaryScreenResult = {
  topicId: string
  prompt: string
  setPrompt: (p: string) => void
  loading: boolean
  extracting: boolean
  pdfB64: string | null
  handleGenerate: () => Promise<void>
  handleImportPdf: () => Promise<void>
  handlePdfDone: (res: PdfResult) => Promise<void>
}

export default function useSummaryScreen(
  initialTopicId?: string,
  initialPrompt?: string,
): UseSummaryScreenResult {
  const { setErrorOverlay } = useOverlay()
  const [topicId] = useState<string>(initialTopicId ?? 'topic-1')
  const [prompt, setPrompt] = useState(initialPrompt ?? '')
  const [loading, setLoading] = useState(false)
  const [pdfB64, setPdfB64] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      // call setter directly from the store to avoid stale closures when
      // navigating away while the async op is running
      useOverlay.getState().setLoadingOverlay(true, 'SummaryScreen')
      const summary = await summariesRepository.createWithAI(topicId, prompt)
      // navigate to details after creation
      navigatorManager.goToSummaryDetails(summary.id, summary)
    } catch (e: any) {
      setErrorOverlay(
        true,
        e?.message || t('summaryScreen.error.generate_failed'),
      )
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
      // show global loading overlay immediately after import
      useOverlay.getState().setLoadingOverlay(true, 'SummaryScreen')
    } catch (err) {
      // keep original behavior: show overlay and clear extracting
      console.error('Erro ao importar PDF', err)
      setErrorOverlay(true, t('summaryScreen.error.import_failed'))
      setExtracting(false)
      useOverlay.getState().setLoadingOverlay(false)
    }
  }

  const handlePdfDone = async (res: PdfResult) => {
    setPdfB64(null)
    if (!res.ok) {
      setErrorOverlay(true, t('summaryScreen.error.read_pdf'))
      setExtracting(false)
      return
    }
    try {
      useOverlay.getState().setLoadingOverlay(true, 'SummaryScreen')
      const normalized = res.text.replaceAll(/\s+/g, ' ').trim()
      const truncated = normalized.slice(0, 8000)
      const summary = await summariesRepository.createWithAI(topicId, truncated)
      navigatorManager.goToSummaryDetails(summary.id, summary)
    } catch (err) {
      console.error('Erro ao gerar resumo a partir do PDF', err)
      setErrorOverlay(true, t('summaryScreen.error.generate_from_pdf_failed'))
    } finally {
      useOverlay.getState().setLoadingOverlay(false)
      setExtracting(false)
    }
  }
  // return only what's used by SummaryScreen
  return {
    topicId,
    prompt,
    setPrompt,
    loading,
    extracting,
    pdfB64,
    handleGenerate,
    handleImportPdf,
    handlePdfDone,
  }
}
