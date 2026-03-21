jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'pt', languageTag: 'pt-BR' }],
}))

import { t } from '../translation'

describe('translation.t', () => {
  it('returns the translated string for a known key', () => {
    expect(t('login.button')).toBe('Entrar')
  })

  it('returns the key itself when the key is unknown', () => {
    expect(t('unknown.key')).toBe('unknown.key')
  })

  it('interpolates variables in the translation', () => {
    const result = t('topicDetails.not_found_id', { id: '42' })
    expect(result).toBe('ID: 42')
  })

  it('replaces missing variable with an empty string', () => {
    const result = t('topicDetails.not_found_id', {})
    expect(result).toBe('ID: ')
  })

  it('returns a common key translation', () => {
    expect(t('common.cancel')).toBe('Cancelar')
  })

  it('returns the register title', () => {
    expect(t('register.title')).toBe('Criar uma conta')
  })

  it('handles score interpolation', () => {
    const result = t('challengeFinished.you_scored', { score: 3, total: 5 })
    expect(result).toBe('Você marcou 3 de 5')
  })
})
