import { getPreferredLanguage } from '../lang'

jest.mock('@/locales', () => ({
  getCurrentLocale: jest.fn(),
}))

const { getCurrentLocale } = require('@/locales')

describe('getPreferredLanguage', () => {
  it('returns en when no locale is available', () => {
    getCurrentLocale.mockReturnValue(null)
    expect(getPreferredLanguage()).toBe('en')
  })

  it('returns the current locale when set', () => {
    getCurrentLocale.mockReturnValue('pt-BR')
    expect(getPreferredLanguage()).toBe('pt-BR')
  })

  it('returns en for English locale', () => {
    getCurrentLocale.mockReturnValue('en')
    expect(getPreferredLanguage()).toBe('en')
  })

  it('returns es for Spanish locale', () => {
    getCurrentLocale.mockReturnValue('es')
    expect(getPreferredLanguage()).toBe('es')
  })
})
