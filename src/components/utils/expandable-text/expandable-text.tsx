import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import type { ExpandableTerm } from '@/types/domain'
import React, { useMemo } from 'react'
import { TextProps } from 'react-native'

export type ExpandableTextProps = TextProps & {
  content: string
  terms: ExpandableTerm[]
  onPressTerm?: (term: ExpandableTerm) => void
}

function computeMatches(content: string, terms: ExpandableTerm[]) {
  const hay = content.toLowerCase()
  const ranges: { start: number; end: number; term: ExpandableTerm }[] = []
  const seen = new Set<string>()
  for (const t of terms) {
    const q = (t.term || '').trim()
    if (!q) continue
    const needle = q.toLowerCase()
    if (seen.has(needle)) continue
    const idx = hay.indexOf(needle)
    if (idx >= 0) {
      ranges.push({ start: idx, end: idx + needle.length, term: t })
      seen.add(needle)
    }
  }
  ranges.sort((a, b) => a.start - b.start)

  const filtered: typeof ranges = []
  let lastEnd = -1
  for (const r of ranges) {
    if (r.start >= lastEnd) {
      filtered.push(r)
      lastEnd = r.end
    }
  }
  return filtered
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  content,
  terms,
  onPressTerm,
  style,
  ...rest
}) => {
  const theme = useTheme()
  const ranges = useMemo(() => computeMatches(content, terms), [content, terms])

  if (!ranges.length)
    return (
      <Text {...rest} style={style}>
        {content}
      </Text>
    )

  const parts: React.ReactNode[] = []
  let cursor = 0
  const font = theme.typography.medium
  const computedVPad = Math.max(
    0,
    Math.floor((font.lineHeight - font.fontSize) / 2),
  )
  for (const r of ranges) {
    if (cursor < r.start) {
      parts.push(
        <Text variant="medium" key={`p-${cursor}`}>
          {content.slice(cursor, r.start)}
        </Text>,
      )
    }
    const slice = content.slice(r.start, r.end)
    parts.push(
      <Text
        key={`h-${r.start}`}
        variant="medium"
        includeFontPadding={false}
        onPress={() => onPressTerm?.(r.term)}
        style={{
          backgroundColor: theme.colors.textHighlight,
          color: theme.colors.textPrimary,
          paddingVertical: computedVPad,
          overflow: 'hidden',
        }}
      >
        {slice}
      </Text>,
    )
    cursor = r.end
  }
  if (cursor < content.length)
    parts.push(<Text key={`tail-${cursor}`}>{content.slice(cursor)}</Text>)

  return (
    <Text variant="medium" {...rest} style={style}>
      {parts}
    </Text>
  )
}

export default ExpandableText
export { computeMatches }
