/* Simple AI service to generate summaries. In production, prefer a secure server-side proxy. */

import {
  KNOWLEDGE_SYSTEM,
  knowledgeUserPrompt,
  MINI_EXPLAIN_SYSTEM,
  SUMMARY_SYSTEM,
  summaryUserPrompt,
} from '@/services/prompts'

type AISummary = {
  title: string
  content: string
  keywords: string[]
}

export type ExpandableTerm = {
  term: string
  mini?: string
}

export type AIKnowledgeSummary = AISummary & {
  expandableTerms?: ExpandableTerm[]
  recommendations?: string[]
}

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY
const OPENAI_BASE_URL =
  process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
const MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini'
const FALLBACK_ON_429 =
  (process.env.EXPO_PUBLIC_OPENAI_FALLBACK_ON_429 ?? 'true').toLowerCase() !==
  'false'
const IS_OPENROUTER = (process.env.EXPO_PUBLIC_OPENAI_BASE_URL || '').includes(
  'openrouter.ai',
)
const APP_URL = process.env.EXPO_PUBLIC_APP_URL || 'http://localhost'
const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME || 'Syntry Dev'

function toJSONSafe(str: string) {
  try {
    return JSON.parse(str)
  } catch {
    // attempt to extract first JSON-like block
    const re = /\{[\s\S]*\}/
    const m = re.exec(str)
    if (m) {
      try {
        return JSON.parse(m[0])
      } catch {}
    }
    return null
  }
}

export const aiService = {
  async generateSummary(prompt: string): Promise<AISummary> {
    if (!OPENAI_API_KEY) return mockSummary(prompt)
    const body = JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SUMMARY_SYSTEM },
        { role: 'user', content: summaryUserPrompt(prompt) },
      ],
      temperature: 0.5,
      max_tokens: 1400,
    })
    const res = await doRequestWithRetry(body)
    if (!res?.ok) return handleErrorOrFallback(res, prompt)
    const parsed = await parseAIResponse(res)
    return parsed
  },

  async generateKnowledgeSummary(prompt: string): Promise<AIKnowledgeSummary> {
    if (!OPENAI_API_KEY) return mockKnowledgeSummary(prompt)
    const body = JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: KNOWLEDGE_SYSTEM },
        { role: 'user', content: knowledgeUserPrompt(prompt) },
      ],
      temperature: 0.5,
      max_tokens: 1600,
    })
    const res = await doRequestWithRetry(body)
    if (!res?.ok) return handleKnowledgeErrorOrFallback(res, prompt)
    const parsed = await parseKnowledgeResponse(res)
    return parsed
  },

  async miniExplain(term: string, context?: string): Promise<string> {
    if (!OPENAI_API_KEY) {
      return `Breve descrição (mock) para "${term}".`
    }
    const system = MINI_EXPLAIN_SYSTEM
    const user =
      `Explique em 1-2 frases o termo: "${term}".` +
      (context ? `\nContexto: ${context.slice(0, 800)}` : '')
    const body = JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
    })
    const res = await doRequestWithRetry(body)
    if (!res?.ok) return `Descrição breve de ${term}.`
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
    return content
  },

  async generateSummaryImage(prompt: string): Promise<string> {
    try {
      if (!OPENAI_API_KEY) {
        // Fallback: placeholder image
        return 'https://picsum.photos/1024/768'
      }
      const imageModel =
        process.env.EXPO_PUBLIC_OPENAI_IMAGE_MODEL || 'gpt-image-1'
      const body = JSON.stringify({
        model: imageModel,
        prompt: [
          'Fotografia ou ilustração com estilo coerente ao tema do resumo, nítida e atraente.',
          'Evite texto, foco em elementos visuais representativos do assunto.',
          `Tema: ${prompt}`,
        ].join('\n'),
        size: '1024x768',
        n: 1,
      })
      const res = await fetch(`${OPENAI_BASE_URL}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body,
      })
      if (!res.ok) return 'https://picsum.photos/1024/768'
      const data = await res.json()
      const url: string = data?.data?.[0]?.url
      return url || 'https://picsum.photos/1024/768'
    } catch {
      return 'https://picsum.photos/1024/768'
    }
  },

  async ttsToBase64(
    text: string,
    format: 'mp3' | 'wav' = 'mp3',
  ): Promise<string | null> {
    try {
      if (!OPENAI_API_KEY) return null
      const ttsModel =
        process.env.EXPO_PUBLIC_OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
      const body = JSON.stringify({
        model: ttsModel,
        input: text,
        voice: 'alloy',
        format,
      })
      const res = await fetch(`${OPENAI_BASE_URL}/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body,
      })
      if (!res.ok) return null
      // OpenAI returns binary; some gateways return JSON with base64. Try both.
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        const b64 = data?.audio || data?.data || null
        return typeof b64 === 'string' ? b64 : null
      }
      const arrayBuffer = await res.arrayBuffer()
      // Convert to base64
      let binary = ''
      const bytes = new Uint8Array(arrayBuffer)
      const len = bytes.byteLength
      for (let i = 0; i < len; i++) binary += String.fromCodePoint(bytes[i])
      // Prefer runtime-safe branch ordering to satisfy lints
      if (typeof btoa === 'undefined') {
        return Buffer.from(binary, 'binary').toString('base64')
      }
      return btoa(binary)
    } catch {
      return null
    }
  },
}

function mockSummary(prompt: string): AISummary {
  return {
    title: prompt.trim().slice(0, 60),
    content:
      `Resumo gerado (mock) para: ${prompt}.\n\n` +
      'Este é um conteúdo simulado. Configure EXPO_PUBLIC_OPENAI_API_KEY para usar o ChatGPT.',
    keywords: ['introdução', 'contexto', 'principais eventos'],
  }
}

function mockKnowledgeSummary(prompt: string): AIKnowledgeSummary {
  return {
    ...mockSummary(prompt),
    expandableTerms: [
      {
        term: 'Independência do Brasil',
        mini: 'Processo de separação de Portugal em 1822.',
      },
      {
        term: 'Dom Pedro I',
        mini: 'Primeiro imperador do Brasil após a independência.',
      },
    ],
    recommendations: [
      'Constituição de 1824',
      'Período Regencial',
      'Revolução Pernambucana',
    ],
  }
}

// buildBody/buildKnowledgeBody removed — prompts centralized in services/prompts

async function doRequestWithRetry(body: string): Promise<Response | null> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const maxAttempts = 3
  let attempt = 0
  let last: Response | null = null
  while (attempt < maxAttempts) {
    attempt++
    try {
      // Add per-request timeout to avoid hanging fetches. AbortController is
      // supported in React Native and modern runtimes.
      const timeoutMs = 30000
      const controller = new AbortController()
      const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs)
      const res = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          ...(IS_OPENROUTER
            ? { 'HTTP-Referer': APP_URL, 'X-Title': APP_NAME }
            : {}),
        },
        body,
        signal: controller.signal,
      })
      clearTimeout(timeoutHandle)
      if (res.ok) return res
      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after') || '0')
        const backoff = retryAfter > 0 ? retryAfter * 1000 : 500 * attempt
        await sleep(backoff)
        last = res
        continue
      }
      if (res.status >= 500 && res.status < 600) {
        await sleep(400 * attempt)
        last = res
        continue
      }
      return res
    } catch {
      // If the fetch was aborted or errored, wait then retry.
      await sleep(300 * attempt)
    }
  }
  return last
}

function handleErrorOrFallback(
  res: Response | null,
  prompt: string,
): AISummary {
  if (res?.status === 429 && FALLBACK_ON_429) {
    return {
      title: `${prompt}`.trim().slice(0, 60),
      content:
        `Resumo gerado (mock - fallback 429) para: ${prompt}.\n\n` +
        'Você atingiu o limite de requisições. Tente novamente mais tarde para um resumo real.',
      keywords: ['conceitos', 'contexto', 'tópicos-chave'],
    }
  }
  throw new Error('AI request failed')
}

async function parseAIResponse(res: Response): Promise<AISummary> {
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
  const parsed = toJSONSafe(content)
  if (!parsed?.title || !parsed?.content) {
    throw new Error(
      'AI returned unexpected format. Enable mock or adjust prompt.',
    )
  }
  return {
    title: String(parsed.title),
    content: String(parsed.content),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String).slice(0, 20)
      : [],
  }
}

async function parseKnowledgeResponse(
  res: Response,
): Promise<AIKnowledgeSummary> {
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
  const parsed = toJSONSafe(content)
  if (!parsed?.title || !parsed?.content) {
    throw new Error('AI knowledge: formato inesperado')
  }
  const terms = Array.isArray(parsed.expandableTerms)
    ? parsed.expandableTerms
        .map((t: any) => ({
          term: String(t.term),
          mini: t.mini ? String(t.mini) : undefined,
        }))
        .filter((t: any) => t.term)
        .slice(0, 30)
    : []
  const recs = Array.isArray(parsed.recommendations)
    ? parsed.recommendations.map(String).slice(0, 20)
    : []
  return {
    title: String(parsed.title),
    content: String(parsed.content),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String).slice(0, 20)
      : [],
    expandableTerms: terms,
    recommendations: recs,
  }
}

function handleKnowledgeErrorOrFallback(
  res: Response | null,
  prompt: string,
): AIKnowledgeSummary {
  const base = handleErrorOrFallback(res, prompt)
  return {
    ...base,
    expandableTerms: [
      { term: 'Contexto histórico', mini: 'Panorama geral do período.' },
      { term: 'Personagens-chave', mini: 'Principais figuras envolvidas.' },
    ],
    recommendations: ['Linhas do tempo', 'Conflitos regionais'],
  }
}

export type { AISummary }
// already exported above
