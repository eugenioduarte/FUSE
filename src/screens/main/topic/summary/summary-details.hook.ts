import { t } from '@/locales/translation'
import { aiService } from '@/services/ai/ai.service'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { whiteboardRepository } from '@/services/repositories/whiteboard.repository'
import { startSession, stopSessionByKey } from '@/services/usage/usage-tracker'
import { useOverlay } from '@/store/overlay.store'
import { Summary } from '@/types/domain'
import { reportError } from '@/utils/errorLogger'
import * as FileSystem from 'expo-file-system/legacy'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform } from 'react-native'

type UseSummaryDetailsArgs = {
  summaryId: string
  initialSummary?: Summary | null
}

export const useSummaryDetails = ({
  summaryId,
  initialSummary,
}: UseSummaryDetailsArgs) => {
  const [summary, setSummary] = useState<Summary | null>(initialSummary ?? null)
  const [loading, setLoading] = useState(!initialSummary)
  const [downloading, setDownloading] = useState(false)
  const [topicName, setTopicName] = useState<string>('')
  const [topicColor, setTopicColor] = useState<string | undefined>()
  const [snippetOpen, setSnippetOpen] = useState(false)
  const [snippetTerm, setSnippetTerm] = useState<
    import('@/types/domain').ExpandableTerm | null
  >(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      if (summary) {
        setLoading(false)
        const topic = await topicsRepository.getById(summary.topicId)
        if (!active) return
        setTopicName(topic?.title ?? '')
        setTopicColor(topic?.backgroundColor || undefined)
        return
      }
      const found = await summariesRepository.getById(summaryId)
      if (!active) return
      setSummary(found)
      if (found) {
        const topic = await topicsRepository.getById(found.topicId)
        if (!active) return
        setTopicName(topic?.title ?? '')
        setTopicColor(topic?.backgroundColor || undefined)
      }
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [summaryId, summary])

  const bg = topicColor || '#0b0b0c'
  const colored = !!topicColor
  const titleColor = colored ? '#111' : 'white'
  const bodyColor = colored ? '#222' : '#ddd'

  useEffect(() => {
    let sessionKey: string | null = null
    ;(async () => {
      try {
        if (!summary) return
        sessionKey = await startSession(summary.topicId, 'summary', summary.id)
      } catch {}
    })()
    return () => {
      if (sessionKey) stopSessionByKey(sessionKey)
    }
  }, [summary])

  const fileDate = useMemo(() => {
    const d = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }, [])

  const sanitize = useCallback(
    (s: string) =>
      (s || '')
        .normalize('NFD')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/(^_+)|(_+$)/g, ''),
    [],
  )

  const buildHtml = useCallback(
    (tName: string, s: Summary) => {
      const safeTitle = s.title || t('summary.default_title')
      const contentHtml = (s.content || '')
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replaceAll('\n', '<br/>')}</p>`)
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
                    <div class="meta">${t('dashboard.calendar.topic')}: ${tName || '-'} • ${t('summary.date_label') || 'Data'}: ${fileDate}</div>
                    ${s.keywords?.length ? `<div class="section-title">${t('summary.keywords_title')}</div><div class="chips">${keywordsHtml}</div>` : ''}
                    <div class="section-title">${t('summary.default_title')}</div>
                    ${contentHtml}
                </body>
                </html>`
    },
    [fileDate],
  )

  const handleDownload = useCallback(async () => {
    if (!summary) return
    if (Platform.OS === 'web') {
      useOverlay
        .getState()
        .setErrorOverlay(true, t('summary.download_not_supported'))
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
        (FileSystem as any).documentDirectory ||
        (FileSystem as any).cacheDirectory ||
        ''
      const targetUri = `${targetDir}${filename}`
      try {
        const info = await FileSystem.getInfoAsync(targetUri)
        if (info.exists)
          await FileSystem.deleteAsync(targetUri, { idempotent: true })
      } catch {}
      await FileSystem.moveAsync({ from: uri, to: targetUri })
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(targetUri, {
          dialogTitle: t('summary.share_dialog_title'),
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf',
        })
      } else {
        useOverlay
          .getState()
          .setSuccessOverlay(
            true,
            t('summary.pdf_saved').replace('{path}', targetUri),
          )
      }
    } catch (e) {
      reportError(e, {
        message: t('summary.download_error'),
        context: { summaryId: summary?.id, action: 'download' },
      })
    } finally {
      setDownloading(false)
    }
  }, [buildHtml, fileDate, sanitize, summary, topicName])

  const handleDeleteSummary = useCallback(
    async (onDone?: () => void) => {
      if (!summary) return

      useOverlay.getState().setNotificationOverlay({
        id: `delete-summary-${summary.id}`,
        title: t('summary.delete.confirm_title'),
        body: t('summary.delete.confirm_body'),
        requireDecision: true,
        acceptLabel: t('summary.delete.accept'),
        denyLabel: t('summary.delete.cancel'),
        onAccept: () => {
          ;(async () => {
            useOverlay.getState().setNotificationOverlay(null)
            try {
              setLoading(true)
              await summariesRepository.deleteById(summary.id)
              await whiteboardRepository.clearAll()
              onDone?.()
            } catch (e) {
              reportError(e, {
                message: t('summary.delete_error'),
                context: { summaryId: summary.id, action: 'delete' },
              })
            } finally {
              setLoading(false)
            }
          })()
        },
        onDeny: () => useOverlay.getState().setNotificationOverlay(null),
        onClose: () => useOverlay.getState().setNotificationOverlay(null),
      })
    },
    [summary],
  )

  const openSnippet = useCallback(
    async (term: import('@/types/domain').ExpandableTerm) => {
      if (!summary) return
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
    },
    [summary],
  )

  const createFromTerm = useCallback(
    async (term: import('@/types/domain').ExpandableTerm) => {
      if (!summary) return
      try {
        setSnippetOpen(false)
        const child = await summariesRepository.createExpandableFromTerm(
          summary,
          term.term,
        )
        return child
      } catch (e) {
        reportError(e, {
          message: t('summary.create_child_error'),
          context: { summaryId: summary.id, term: term?.term },
        })
        return null
      }
    },
    [summary],
  )

  return {
    summary,
    loading,
    downloading,
    topicName,
    topicColor,
    bg,
    titleColor,
    bodyColor,
    snippetOpen,
    snippetTerm,
    setSnippetOpen,
    openSnippet,
    createFromTerm,
    handleDownload,
    handleDeleteSummary,
    getParentSummary: async () => {
      if (!summary?.parentSummaryId) return null
      try {
        const parent = await summariesRepository.getById(
          summary.parentSummaryId,
        )
        return parent
      } catch (e) {
        reportError(e, {
          message: t('summary.parent_fetch_error'),
          context: { parentId: summary?.parentSummaryId },
        })
        return null
      }
    },
    setSummary,
  }
}
