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
  | 'thumbs'

export const AVATAR_STYLES: AvatarStyle[] = [
  // Use only DiceBear's Thumbs style for generated avatars
  'thumbs',
]

export function randomSeed() {
  return crypto.randomUUID().replace(/-/g, '').substring(0, 8)
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
