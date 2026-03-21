import { useTheme } from '@/hooks/use-theme'
import { useWindowDimensions } from 'react-native'

type Item = { title: string; value: number; color: string }

type ComputedItem = {
  item: Item
  index: number
  r: number
  progress: number
  endAngle: number
  trackPath: string
  progPath: string
  end: { x: number; y: number }
}

export default function useSummaryProgressArcs(data: Item[] = []) {
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()

  const strokeBase = 12
  const gapBase = 18
  const outerBase = 90
  const maxSize = screenWidth * 0.9

  const outerRadius = gapBase * (data.length - 1) + outerBase
  const margin = 28
  let size = (outerRadius + strokeBase / 2 + margin) * 2

  const scale = size > maxSize ? maxSize / size : 1
  size *= scale

  const stroke = strokeBase * scale
  const borderOffset = 1 * scale
  const gap = gapBase * scale
  const sweep = (240 * Math.PI) / 180
  const startAngle = (-120 * Math.PI) / 180
  const cx = size / 2
  const cy = size / 2

  const maxValue = data.length ? Math.max(...data.map((d) => d.value)) : 0

  function polar(cx: number, cy: number, r: number, a: number) {
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  }

  function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
    const p0 = polar(cx, cy, r, a0)
    const p1 = polar(cx, cy, r, a1)
    const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
  }

  const items: ComputedItem[] = data.map((item, i) => {
    const r = outerBase * scale + gap * (data.length - 1 - i)
    const progress = maxValue ? item.value / maxValue : 0
    const endAngle = startAngle + sweep * progress
    const endFull = startAngle + sweep

    const trackPath = arcPath(cx, cy, r, startAngle, endFull)
    const progPath = arcPath(cx, cy, r, startAngle, endAngle)
    const end = polar(cx, cy, r, endAngle)

    return {
      item,
      index: i + 1,
      r,
      progress,
      endAngle,
      trackPath,
      progPath,
      end,
    }
  })

  return {
    theme,
    size,
    stroke,
    borderOffset,
    cx,
    cy,
    items,
    maxValue,
  }
}
