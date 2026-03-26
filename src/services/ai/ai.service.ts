/* AI service — calls the Anthropic Claude API via the anthropicProxy Firebase Function.
 * The ANTHROPIC_API_KEY lives in Firebase Secret Manager and never touches the client bundle.
 * Architecture: App → Firebase ID token (onCall) → anthropicProxy → Anthropic API
 */

import { getCurrentLocale } from '@/locales'
import { getFirebaseAuth } from '@/services/firebase/auth.service'
import {
  KNOWLEDGE_SYSTEM,
  knowledgeUserPrompt,
  MINI_EXPLAIN_SYSTEM,
  SUMMARY_SYSTEM,
  summaryUserPrompt,
} from '@/services/prompts'
import { getApp } from 'firebase/app'
import { getFunctions, httpsCallable } from 'firebase/functions'

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

const MODEL = process.env.EXPO_PUBLIC_ANTHROPIC_MODEL || 'claude-haiku-4-5'

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON string returned by the AI.
 * Handles: plain JSON, markdown code blocks (```json ... ```), and
 * prose-wrapped JSON (extracts the first { ... } block).
 */
export function toJSONSafe(str: string): any {
  if (!str) return null
  // 1. Try direct parse
  try {
    return JSON.parse(str)
  } catch {}
  // 2. Strip markdown code block (```json ... ``` or ``` ... ```)
  const codeBlock = /```(?:json)?\s*([\s\S]*?)```/.exec(str)
  if (codeBlock) {
    try {
      return JSON.parse(codeBlock[1].trim())
    } catch {}
  }
  // 3. Extract first { ... } block
  const obj = /\{[\s\S]*\}/.exec(str)
  if (obj) {
    try {
      return JSON.parse(obj[0])
    } catch {}
  }
  return null
}

/**
 * Split a messages array (OpenAI-style) into system + user/assistant messages
 * so they can be sent to the Anthropic API format.
 */
function splitMessages(messages: { role: string; content: string }[]) {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content)
  const chatMessages = messages.filter((m) => m.role !== 'system')
  return {
    system: systemParts.join('\n') || undefined,
    messages: chatMessages,
  }
}

// ── Core request function ─────────────────────────────────────────────────────

/**
 * Shared helper used by all challenge generators.
 * Accepts an OpenAI-style messages array (system + user/assistant) and
 * returns the raw text content from Claude, via the anthropicProxy Firebase Function.
 * Throws if the user is not authenticated.
 */
export async function callAI(
  messages: { role: string; content: string }[],
  temperature = 0.4,
): Promise<string> {
  if (!getFirebaseAuth().currentUser) {
    throw new Error('User not authenticated — sign in to use AI features.')
  }
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
  const systemWithLang = [`Always respond in ${language}.`, system].filter(Boolean).join('\n')

  const proxy = httpsCallable<
    {
      messages: { role: string; content: string }[]
      system?: string
      temperature: number
      model: string
    },
    { text: string }
  >(getFunctions(getApp()), 'anthropicProxy')

  const result = await proxy({
    messages: chatMessages,
    system: systemWithLang || undefined,
    temperature,
    model: MODEL,
  })

  return result.data.text
}

// ── aiService (summary / knowledge / mini-explain / image / tts) ─────────────

export const aiService = {
  async generateSummary(prompt: string): Promise<AISummary> {
    if (!getFirebaseAuth().currentUser) return mockSummary(prompt)
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
    if (!getFirebaseAuth().currentUser) return mockKnowledgeSummary(prompt)
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
    if (!getFirebaseAuth().currentUser) return `Brief description (mock) for "${term}".`
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

  async ttsToBase64(_text: string, _format: 'mp3' | 'wav' = 'mp3'): Promise<string | null> {
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
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 20) : [],
  }
}

function parseKnowledgeSummary(text: string, _fallbackPrompt: string): AIKnowledgeSummary {
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
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.map(String).slice(0, 20) : [],
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
