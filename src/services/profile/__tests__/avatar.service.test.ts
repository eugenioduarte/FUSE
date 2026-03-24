import {
  AVATAR_STYLES,
  generateAvatarUrl,
  parseAvatarUrl,
  randomSeed,
} from '../avatar.service'

// crypto.randomUUID is not available in Node.js test environment
let _uuidCounter = 0
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(
      () =>
        `${String(++_uuidCounter).padStart(8, '0')}-cccc-dddd-eeee-000000000000`,
    ),
  },
  configurable: true,
})

describe('AVATAR_STYLES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(AVATAR_STYLES)).toBe(true)
    expect(AVATAR_STYLES.length).toBeGreaterThan(0)
  })

  it('contains thumbs', () => {
    expect(AVATAR_STYLES).toContain('thumbs')
  })
})

describe('randomSeed', () => {
  it('returns an 8-character alphanumeric string', () => {
    const seed = randomSeed()
    expect(seed).toMatch(/^[a-f0-9]{8}$/)
  })

  it('generates different seeds on each call', () => {
    const seeds = new Set(Array.from({ length: 10 }, () => randomSeed()))
    expect(seeds.size).toBeGreaterThan(1)
  })
})

describe('generateAvatarUrl', () => {
  it('builds a valid DiceBear PNG URL', () => {
    const url = generateAvatarUrl('thumbs', 'abc12345')
    expect(url).toContain('https://api.dicebear.com/7.x/thumbs/png')
    expect(url).toContain('seed=abc12345')
    expect(url).toContain('size=200')
  })

  it('URL-encodes the seed', () => {
    const url = generateAvatarUrl('thumbs', 'hello world')
    expect(url).toContain('seed=hello%20world')
  })

  it('generates a URL with a random seed when none is provided', () => {
    const url = generateAvatarUrl('thumbs')
    expect(url).toContain('https://api.dicebear.com/7.x/thumbs/png')
    expect(url).toContain('seed=')
  })

  it('includes backgroundType=gradientLinear', () => {
    const url = generateAvatarUrl('thumbs', 'seed1')
    expect(url).toContain('backgroundType=gradientLinear')
  })
})

describe('parseAvatarUrl', () => {
  it('parses a valid DiceBear URL back to style and seed', () => {
    const url = generateAvatarUrl('thumbs', 'abc12345')
    const parsed = parseAvatarUrl(url)
    expect(parsed).toEqual({ style: 'thumbs', seed: 'abc12345' })
  })

  it('returns null for a non-DiceBear URL', () => {
    expect(parseAvatarUrl('https://example.com/avatar.png')).toBeNull()
  })

  it('returns null for an invalid URL string', () => {
    expect(parseAvatarUrl('not-a-url')).toBeNull()
  })

  it('rounds-trips: generateAvatarUrl → parseAvatarUrl', () => {
    const seed = 'testSeed'
    const url = generateAvatarUrl('adventurer', seed)
    const parsed = parseAvatarUrl(url)
    expect(parsed?.style).toBe('adventurer')
    expect(parsed?.seed).toBe(seed)
  })
})
