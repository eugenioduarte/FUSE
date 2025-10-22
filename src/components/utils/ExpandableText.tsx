import React, { useMemo } from 'react'
import { Text, TextProps, TouchableOpacity } from 'react-native'
import type { ExpandableTerm } from '../../types/domain'

export type ExpandableTextProps = TextProps & {
  content: string
  terms: ExpandableTerm[]
  onPressTerm?: (term: ExpandableTerm) => void
  highlightColor?: string
}

// Build non-overlapping highlights for first occurrence of each term
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
  // drop overlaps
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
  highlightColor = '#fef08a',
  style,
  ...rest
}) => {
  const ranges = useMemo(() => computeMatches(content, terms), [content, terms])

  if (!ranges.length)
    return (
      <Text {...rest} style={style}>
        {content}
      </Text>
    )

  const parts: React.ReactNode[] = []
  let cursor = 0
  for (const r of ranges) {
    if (cursor < r.start) {
      parts.push(
        <Text key={`p-${cursor}`}>{content.slice(cursor, r.start)}</Text>,
      )
    }
    const slice = content.slice(r.start, r.end)
    parts.push(
      <TouchableOpacity
        key={`h-${r.start}`}
        onPress={() => onPressTerm?.(r.term)}
      >
        <Text
          style={{
            backgroundColor: highlightColor,
            color: '#111',
            fontWeight: '700',
          }}
        >
          {slice}
        </Text>
      </TouchableOpacity>,
    )
    cursor = r.end
  }
  if (cursor < content.length)
    parts.push(<Text key={`tail-${cursor}`}>{content.slice(cursor)}</Text>)

  return (
    <Text {...rest} style={style}>
      {parts}
    </Text>
  )
}

export default ExpandableText
export { computeMatches }
