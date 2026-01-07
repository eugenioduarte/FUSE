import pt from './pt.json'

export function t(key: string, vars?: Record<string, any>): string {
  const raw = (pt as Record<string, string>)[key] || key
  if (!vars) return raw
  return raw.replace(/\{([^}]+)\}/g, (_, name) => {
    const v = vars[name]
    if (v === undefined || v === null) return ''
    return String(v)
  })
}

export default { t }
