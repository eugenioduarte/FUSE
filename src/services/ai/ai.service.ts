/* Simple AI service — Anthropic Claude API. In production, prefer a secure server-side proxy. */

import {
  KNOWLEDGE_SYSTEM,
  knowledgeUserPrompt,
  MINI_EXPLAIN_SYSTEM,
  SUMMARY_SYSTEM,
  summaryUserPrompt,
} from '@/services/prompts'
import { getCurrentLocale } from '@/locales'

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

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1'
const ANTHROPIC_VERSION = '2023-06-01'
const MODEL =
  process.env.EXPO_PUBLIC_ANTHROPIC_MODEL || 'claude-haiku-4-5'
const MAX_TOKENS = 4096

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON string returned by the AI.
 * Handles: plain JSON, markdown code blocks (```json ... ```), and
 * prose-wrapped JSON (extracts the first { ... } block).
 */
export function toJSONSafe(str: string): any {
  if (!str) return null
  // 1. Try direct parse
  try { return JSON.parse(str) } catch {}
  // 2. Strip markdown code block (```json ... ``` or ``` ... ```)
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(str)
  if (codeBlock) {
    try { return JSON.parse(codeBlock[1].trim()) } catch {}
  }
  // 3. Extract first { ... } block
  const obj = /\{[\s\S]*\}/.exec(str)
  if (obj) {
    try { return JSON.parse(obj[0]) } catch {}
  }
  return null
}

/**
 * Split a messages array (OpenAI-style) into system + user/assistant messages
 * so they can be sent to the Anthropic API format.
 */
function splitMessages(messages: { role: string; content: string }[]) {
  const systemParts = messages
    .filter((m) => m.role === 'system')
    .map((m) => m.content)
  const chatMessages = messages.filter((m) => m.role !== 'system')
  return {
    system: systemParts.join('\n') || undefined,
    messages: chatMessages,
  }
}

// ── Core request function ─────────────────────────────────────────────────────

async function doRequestWithRetry(
  body: string,
): Promise<Response | null> {
  if (!ANTHROPIC_API_KEY) return null
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const maxAttempts = 3
  let attempt = 0
  let last: Response | null = null

  while (attempt < maxAttempts) {
    attempt++
    try {
      const controller = new AbortController()
      const timeoutHandle = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
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
      await sleep(300 * attempt)
    }
  }
  return last
}

/**
 * Shared helper used by all challenge generators.
 * Accepts an OpenAI-style messages array (system + user/assistant) and
 * returns the raw text content from Claude.
 */
export async function callAI(
  messages: { role: string; content: string }[],
  temperature = 0.4,
): Promise<string> {
  if (!ANTHROPIC_API_KEY) throw new Error('EXPO_PUBLIC_ANTHROPIC_API_KEY not set')
  const locale = getCurrentLocale()
  const langNames: Record<string, string> = {
    pt: 'Portuguese',
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    zh: 'Chinese',
  }
  const language = langNames[locale] ?? locale
  const { system, messages: chatMessages } = splitMessages(messages)
  const systemWithLang = [
    `Always respond in ${language}.`,
    system,
  ].filter(Boolean).join('\n')
  const body = JSON.stringify({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    temperature,
    ...(systemWithLang ? { system: systemWithLang } : {}),
    messages: chatMessages,
  })
  const res = await doRequestWithRetry(body)
  if (!res?.ok) throw new Error(`AI request failed: ${res?.status ?? 'no response'}`)
  const data = await res.json()
  return data?.content?.[0]?.text?.trim?.() ?? ''
}

// ── aiService (summary / knowledge / mini-explain / image / tts) ─────────────

export const aiService = {
  async generateSummary(prompt: string): Promise<AISummary> {
    if (!ANTHROPIC_API_KEY) return mockSummary(prompt)
    const text = await callAI(
      [
        { role: 'system', content: SUMMARY_SYSTEM },
        { role: 'user', content: summaryUserPrompt(prompt) },
      ],
      0.5,
    )
    return parseSummary(text, prompt)
  },

  async generateKnowledgeSummary(prompt: string): Promise<AIKnowledgeSummary> {
    if (!ANTHROPIC_API_KEY) return mockKnowledgeSummary(prompt)
    const text = await callAI(
      [
        { role: 'system', content: KNOWLEDGE_SYSTEM },
        { role: 'user', content: knowledgeUserPrompt(prompt) },
      ],
      0.5,
    )
    return parseKnowledgeSummary(text, prompt)
  },

  async miniExplain(term: string, context?: string): Promise<string> {
    if (!ANTHROPIC_API_KEY) return `Brief description (mock) for "${term}".`
    try {
      const user =
        `Explain in 1-2 sentences the term: "${term}".` +
        (context ? `\nContext: ${context.slice(0, 800)}` : '')
      return await callAI(
        [
          { role: 'system', content: MINI_EXPLAIN_SYSTEM },
          { role: 'user', content: user },
        ],
        0.4,
      )
    } catch {
      return `Brief description of ${term}.`
    }
  },

  async generateSummaryImage(_prompt: string): Promise<string> {
    // Anthropic does not have an image generation API — return placeholder
    return 'https://picsum.photos/1024/768'
  },

  async ttsToBase64(
    _text: string,
    _format: 'mp3' | 'wav' = 'mp3',
  ): Promise<string | null> {
    // Anthropic does not have a TTS API
    return null
  },
}

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseSummary(text: string, _fallbackPrompt: string): AISummary {
  const parsed = toJSONSafe(text)
  if (!parsed?.title || !parsed?.content) {
    throw new Error('AI returned unexpected format.')
  }
  return {
    title: String(parsed.title),
    content: String(parsed.content),
    keywords: Array.isArray(parsed.keywords)
      ? parsed.keywords.map(String).slice(0, 20)
      : [],
  }
}

function parseKnowledgeSummary(
  text: string,
  _fallbackPrompt: string,
): AIKnowledgeSummary {
  const parsed = toJSONSafe(text)
  if (!parsed?.title || !parsed?.content) {
    throw new Error('AI knowledge: unexpected format')
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

// ── Mocks ─────────────────────────────────────────────────────────────────────

function mockSummary(prompt: string): AISummary {
  return {
    title: prompt.trim().slice(0, 60),
    content:
      `Summary generated (mock) for: ${prompt}.\n\n` +
      'This is simulated content. Set EXPO_PUBLIC_ANTHROPIC_API_KEY to use the real AI.',
    keywords: ['introduction', 'context', 'main events'],
  }
}

function mockKnowledgeSummary(prompt: string): AIKnowledgeSummary {
  return {
    ...mockSummary(prompt),
    expandableTerms: [
      { term: 'Independence of Brazil', mini: 'Separation from Portugal in 1822.' },
      { term: 'Dom Pedro I', mini: 'First emperor of Brazil after independence.' },
    ],
    recommendations: ['Constitution of 1824', 'Regency Period', 'Pernambuco Revolution'],
  }
}

export type { AISummary }
