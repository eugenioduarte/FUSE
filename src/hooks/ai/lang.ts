import * as Localization from 'expo-localization'

// Resolve a BCP-47 language tag for AI output (e.g., 'pt-BR', 'en')
export function getPreferredLanguage(): string {
  const locales = Localization.getLocales()
  const first = locales[0]
  if (!first) return 'pt-BR'
  // Prefer full tag if available (language + region)
  const tag = first.languageTag || first.languageCode || 'pt-BR'
  // For now, default to Portuguese unless explicitly another
  if ((first.languageCode || '').toLowerCase().startsWith('pt')) return 'pt-BR'
  return tag
}
