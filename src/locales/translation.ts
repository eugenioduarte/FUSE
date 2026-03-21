import * as Localization from 'expo-localization'
import en from './en.json'
import pt from './pt.json'

const langCode = Localization.getLocales()?.[0]?.languageCode ?? 'pt'
const dict: Record<string, string> = langCode === 'en' ? (en as Record<string, string>) : (pt as Record<string, string>)

export function t(key: string, vars?: Record<string, any>): string {
  const raw = dict[key] || key
  if (!vars) return raw
  return raw.replace(/\{([^}]+)\}/g, (_, name) => {
    const v = vars[name]
    if (v === undefined || v === null) return ''
    return String(v)
  })
}

export default { t }
