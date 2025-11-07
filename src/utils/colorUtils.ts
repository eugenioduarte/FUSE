export function isColorDark(hex: string): boolean {
  const color = hex.replace('#', '')
  const r = Number.parseInt(color.substring(0, 2), 16)
  const g = Number.parseInt(color.substring(2, 4), 16)
  const b = Number.parseInt(color.substring(4, 6), 16)

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b

  return luminance < 128
}

export function lightenHex(hex: string, percent: number): string {
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return hex
  const r = Number.parseInt(clean.substring(0, 2), 16)
  const g = Number.parseInt(clean.substring(2, 4), 16)
  const b = Number.parseInt(clean.substring(4, 6), 16)

  const nr = Math.round(r + (255 - r) * Math.min(Math.max(percent, 0), 1))
  const ng = Math.round(g + (255 - g) * Math.min(Math.max(percent, 0), 1))
  const nb = Math.round(b + (255 - b) * Math.min(Math.max(percent, 0), 1))

  const toHex = (v: number) => v.toString(16).padStart(2, '0')
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`.toUpperCase()
}
