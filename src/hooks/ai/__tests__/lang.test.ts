import { getPreferredLanguage } from '../lang'

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}))

const { getLocales } = require('expo-localization')

describe('getPreferredLanguage', () => {
  it('returns pt-BR when no locales are available', () => {
    getLocales.mockReturnValue([])
    expect(getPreferredLanguage()).toBe('pt-BR')
  })

  it('returns pt-BR for Portuguese locale', () => {
    getLocales.mockReturnValue([{ languageCode: 'pt', languageTag: 'pt-BR' }])
    expect(getPreferredLanguage()).toBe('pt-BR')
  })

  it('returns the language tag for non-Portuguese locales', () => {
    getLocales.mockReturnValue([{ languageCode: 'en', languageTag: 'en-US' }])
    expect(getPreferredLanguage()).toBe('en-US')
  })

  it('falls back to languageCode when languageTag is missing', () => {
    getLocales.mockReturnValue([{ languageCode: 'es', languageTag: '' }])
    expect(getPreferredLanguage()).toBe('es')
  })
})
