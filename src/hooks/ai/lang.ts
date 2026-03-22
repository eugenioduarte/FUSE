import { getCurrentLocale } from '@/locales'

// Resolve a BCP-47 language tag for AI output (e.g., 'en', 'pt-BR')
export function getPreferredLanguage(): string {
  const locale = getCurrentLocale()
  if (!locale) return 'en'
  return locale
}
