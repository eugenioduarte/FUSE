import pt from './pt.json'

export function t(key: string): string {
  return (pt as Record<string, string>)[key] || key
}

export default { t }
