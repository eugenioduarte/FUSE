import * as admin from 'firebase-admin'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

admin.initializeApp()

const anthropicKey = defineSecret('ANTHROPIC_API_KEY')

const ANTHROPIC_BASE_URL = 'https://api.anthropic.com/v1'
const ANTHROPIC_VERSION = '2023-06-01'

interface ProxyRequest {
  messages: { role: string; content: string }[]
  system?: string
  temperature?: number
  model?: string
}

interface AnthropicResponse {
  content?: { text?: string }[]
}

/**
 * Firebase Function: anthropicProxy
 *
 * Secure server-side proxy between the FUSE app and the Anthropic Claude API.
 * The ANTHROPIC_API_KEY never leaves this function — it lives in Firebase Secret Manager.
 *
 * onCall v2 automatically:
 *   - Verifies the Firebase ID token sent by the client SDK
 *   - Populates request.auth with { uid, token } if valid
 *   - Rejects with HttpsError('unauthenticated') if token is missing or invalid
 *
 * Usage from the client (ai.service.ts):
 *   const proxy = httpsCallable<ProxyRequest, { text: string }>(getFunctions(getApp()), 'anthropicProxy')
 *   const result = await proxy({ messages, system, temperature })
 *   return result.data.text
 */
export const anthropicProxy = onCall<ProxyRequest>(
  {
    secrets: [anthropicKey],
    region: 'us-central1',
    timeoutSeconds: 60,
  },
  async (request) => {
    // Guard: reject unauthenticated calls
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be signed in to use AI features.')
    }

    const { messages, system, temperature = 0.4, model = 'claude-haiku-4-5' } = request.data

    if (!Array.isArray(messages) || messages.length === 0) {
      throw new HttpsError('invalid-argument', 'messages must be a non-empty array.')
    }

    const body: Record<string, unknown> = {
      model,
      max_tokens: 4096,
      temperature,
      messages,
    }
    if (system) body.system = system

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
    const maxAttempts = 3

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let res: Response
      try {
        res = await fetch(`${ANTHROPIC_BASE_URL}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey.value(),
            'anthropic-version': ANTHROPIC_VERSION,
          },
          body: JSON.stringify(body),
        })
      } catch (err) {
        if (attempt === maxAttempts) {
          throw new HttpsError('internal', 'Network error reaching Anthropic.')
        }
        await sleep(300 * attempt)
        continue
      }

      if (res.ok) {
        const data = (await res.json()) as AnthropicResponse
        const text = data?.content?.[0]?.text?.trim() ?? ''
        return { text }
      }

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after') || '0')
        const backoff = retryAfter > 0 ? retryAfter * 1000 : 500 * attempt
        await sleep(backoff)
        continue
      }

      if (res.status >= 500 && attempt < maxAttempts) {
        await sleep(400 * attempt)
        continue
      }

      const errText = await res.text().catch(() => '')
      throw new HttpsError('internal', `Anthropic error ${res.status}: ${errText.slice(0, 200)}`)
    }

    throw new HttpsError('internal', 'AI request failed after retries.')
  },
)
