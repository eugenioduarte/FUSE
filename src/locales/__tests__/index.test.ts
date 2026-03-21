jest.mock('expo-localization', () => ({
  getLocales: jest.fn().mockReturnValue([{ languageCode: 'en' }]),
}))

jest.mock('i18n-js', () => {
  class I18n {
    translations: Record<string, any>
    locale: string
    enableFallback: boolean
    constructor(translations: Record<string, any>) {
      this.translations = translations
      this.locale = 'en'
      this.enableFallback = true
    }
    t(key: string, _options?: Record<string, any>): string {
      return this.translations?.[this.locale]?.[key] ?? key
    }
  }
  return { I18n }
})

describe('locales/index - t()', () => {
  let tFn: (key: string, options?: any) => string

  beforeEach(() => {
    jest.resetModules()
    tFn = require('../index').t
  })

  it('exports a t function', () => {
    expect(typeof tFn).toBe('function')
  })

  it('returns the key when translation is missing', () => {
    const result = tFn('missing.key')
    expect(result).toBe('missing.key')
  })
})
