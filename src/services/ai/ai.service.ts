/* Simple AI service to generate summaries. In production, prefer a secure server-side proxy. */

type AISummary = {
  title: string
  content: string
  keywords: string[]
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
    const body = buildBody(prompt)
    const res = await doRequestWithRetry(body)
    if (!res?.ok) return handleErrorOrFallback(res, prompt)
    const parsed = await parseAIResponse(res)
    return parsed
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

function buildBody(prompt: string) {
  const system =
    'Você é um assistente que cria resumos estruturados. Responda SOMENTE em JSON com as chaves: title, content, keywords (array de strings). Sem textos adicionais.'
  const user = `Gere um resumo completo e didático sobre: "${prompt}".\n- Tamanho: 6-10 parágrafos curtos.\n- Inclua keywords relevantes (5-12) que podem virar sub-resumos.`
  return JSON.stringify({
    model: MODEL,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.5,
  })
}

async function doRequestWithRetry(body: string): Promise<Response | null> {
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  const maxAttempts = 3
  let attempt = 0
  let last: Response | null = null
  while (attempt < maxAttempts) {
    attempt++
    try {
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
      })
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

export type { AISummary }
