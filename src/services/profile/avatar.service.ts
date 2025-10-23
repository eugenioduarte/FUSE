export type AvatarStyle =
  | 'adventurer'
  | 'adventurer-neutral'
  | 'avataaars'
  | 'bottts'
  | 'big-ears'
  | 'big-smile'
  | 'bottts-neutral'
  | 'croodles'
  | 'fun-emoji'
  | 'identicon'
  | 'pixel-art'
  | 'pixel-art-neutral'

export const AVATAR_STYLES: AvatarStyle[] = [
  'adventurer',
  'bottts',
  'identicon',
  'pixel-art',
  'fun-emoji',
]

export function randomSeed() {
  return Math.random().toString(36).substring(2, 10)
}

export function generateAvatarUrl(style: AvatarStyle, seed?: string) {
  const theSeed = seed || randomSeed()
  // Use PNG output to avoid SVG rendering dependencies in React Native
  return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(
    theSeed,
  )}&size=200&backgroundType=gradientLinear`
}

export function parseAvatarUrl(
  url: string,
): { style: string; seed: string } | null {
  try {
    const u = new URL(url)
    // path looks like /7.x/{style}/png
    const parts = u.pathname.split('/').filter(Boolean)
    const style = parts[1] // ['7.x','{style}','png']
    const seed = u.searchParams.get('seed') || ''
    if (style && seed) return { style, seed }
    return null
  } catch {
    return null
  }
}
