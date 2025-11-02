import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'

type Item = { title: string; minutes: number; color: string }
type Props = { data: Item[] }

export function SummaryProgressArcs({ data }: Props) {
  const theme = useTheme()
  const { width: screenWidth } = useWindowDimensions()
  if (!data?.length) return null

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

  const maxMinutes = Math.max(...data.map((d) => d.minutes))

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* O grupo principal é girado -90°, e o texto interno será compensado */}
          <G rotation={-90} origin={`${cx},${cy}`}>
            {data.map((item, i) => {
              const r = outerBase * scale + gap * (data.length - 1 - i)
              const progress = maxMinutes ? item.minutes / maxMinutes : 0
              const endAngle = startAngle + sweep * progress
              const endFull = startAngle + sweep

              const track = arcPath(cx, cy, r, startAngle, endFull)
              const prog = arcPath(cx, cy, r, startAngle, endAngle)
              const end = polar(cx, cy, r, endAngle)
              const color = item.color
              const index = i + 1

              return (
                <React.Fragment key={item.title}>
                  {/* Fundo */}
                  <Path
                    d={track}
                    stroke={theme.colors.backgroundTertiary}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Borda preta */}
                  <Path
                    d={prog}
                    stroke="#000"
                    strokeWidth={stroke + borderOffset * 2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Arco colorido */}
                  <Path
                    d={prog}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Marcador final com número centralizado e girado */}
                  <Circle
                    cx={end.x}
                    cy={end.y}
                    r={10 * scale}
                    fill={color}
                    stroke={theme.colors.borderColor}
                    strokeWidth={2 * scale}
                  />
                  <SvgText
                    x={end.x}
                    y={end.y + 3 * scale}
                    fontSize={10 * scale}
                    fontWeight="700"
                    fill={theme.colors.borderColor}
                    textAnchor="middle"
                    rotation={90}
                    origin={`${end.x},${end.y}`}
                  >
                    {index}
                  </SvgText>
                </React.Fragment>
              )
            })}
          </G>
        </Svg>
      </View>

      {/* LEGENDA */}
      <View
        style={[
          styles.legendContainer,
          { width: size, marginTop: -(data.length * 15) },
        ]}
      >
        {data.map((item, i) => {
          const index = i + 1
          return (
            <View key={item.title} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  { backgroundColor: item.color, borderColor: '#000' },
                ]}
              >
                <Text style={styles.legendNumber}>{index}</Text>
              </View>
              <Text style={[styles.legendText, { color: item.color }]}>
                {item.title}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

function polar(cx: number, cy: number, r: number, a: number) {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, r, a0)
  const p1 = polar(cx, cy, r, a1)
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0
  return `M ${p0.x} ${p0.y} A ${r} ${r} 0 ${large} 1 ${p1.x} ${p1.y}`
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 6,
    marginVertical: 4,
  },
  legendColor: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  legendNumber: {
    color: '#000',
    fontSize: 10,
    fontWeight: '700',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
})
