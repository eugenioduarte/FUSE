import { aiService, callAI, toJSONSafe } from '../ai.service'

// ── toJSONSafe ───────────────────────────────────────────────────────────────

describe('toJSONSafe', () => {
  it('returns null for empty string', () => {
    expect(toJSONSafe('')).toBeNull()
  })

  it('parses plain JSON', () => {
    expect(toJSONSafe('{"a":1}')).toEqual({ a: 1 })
  })

  it('strips markdown json code block and parses', () => {
    expect(toJSONSafe('```json\n{"b":2}\n```')).toEqual({ b: 2 })
  })

  it('strips plain markdown code block and parses', () => {
    expect(toJSONSafe('```\n{"c":3}\n```')).toEqual({ c: 3 })
  })

  it('extracts first {...} block from prose-wrapped JSON', () => {
    expect(toJSONSafe('here is the answer {"d":4} done')).toEqual({ d: 4 })
  })

  it('returns null for completely unparseable text', () => {
    expect(toJSONSafe('just some random text')).toBeNull()
  })

  it('handles nested JSON correctly', () => {
    const obj = { title: 'Test', keywords: ['a', 'b'] }
    expect(toJSONSafe(JSON.stringify(obj))).toEqual(obj)
  })
})

// ── callAI without API key ───────────────────────────────────────────────────

describe('callAI', () => {
  it('throws when EXPO_PUBLIC_ANTHROPIC_API_KEY is not set', async () => {
    delete process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
    await expect(callAI([{ role: 'user', content: 'hello' }])).rejects.toThrow(
      'EXPO_PUBLIC_ANTHROPIC_API_KEY not set',
    )
  })
})

// ── aiService – mock mode (no API key) ───────────────────────────────────────

describe('aiService', () => {
  beforeEach(() => {
    delete process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY
  })

  describe('generateSummary', () => {
    it('returns a mock summary when API key is absent', async () => {
      const result = await aiService.generateSummary('Linear Algebra')
      expect(result.title).toBeTruthy()
      expect(typeof result.content).toBe('string')
      expect(Array.isArray(result.keywords)).toBe(true)
    })
  })

  describe('generateKnowledgeSummary', () => {
    it('returns a mock knowledge summary when API key is absent', async () => {
      const result = await aiService.generateKnowledgeSummary('Photosynthesis')
      expect(result.title).toBeTruthy()
      expect(Array.isArray(result.expandableTerms)).toBe(true)
      expect(Array.isArray(result.recommendations)).toBe(true)
    })
  })

  describe('miniExplain', () => {
    it('returns mock string when API key is absent', async () => {
      const result = await aiService.miniExplain('entropy')
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  describe('generateSummaryImage', () => {
    it('always returns the picsum placeholder URL', async () => {
      const url = await aiService.generateSummaryImage('anything')
      expect(url).toBe('https://picsum.photos/1024/768')
    })
  })

  describe('ttsToBase64', () => {
    it('always returns null (Anthropic has no TTS API)', async () => {
      const result = await aiService.ttsToBase64('hello')
      expect(result).toBeNull()
    })
  })
})
