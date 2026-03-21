import { Text } from '@/components/ui-text/UiText'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React, { useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg'

export function TopicCardChart({
  backgroundColor,
}: {
  backgroundColor?: string
}) {
  const theme = useTheme()
  const styles = createStyles(theme as ThemeType, backgroundColor)
  const data = [
    { day: 'S', value: 80 },
    { day: 'M', value: 25 },
    { day: 'T', value: 40 },
    { day: 'W', value: 20 },
    { day: 'T', value: 10 },
    { day: 'F', value: 35 },
    { day: 'S', value: 15 },
  ]

  const [width, setWidth] = useState(0)
  const height = 50
  const padding = 5
  const scaleFactor = 4
  const verticalScale = 0.35

  const todayIndex = new Date().getDay()

  const validValues = data
    // scale plotted values to make the line visually flatter
    .map((d) => (d.value === undefined ? undefined : d.value / scaleFactor))
    .filter((v): v is number => v !== undefined && !Number.isNaN(v))

  const max = Math.max(...validValues, 1)
  const min = Math.min(...validValues, 0)

  const stepX = (width - padding * 2) / (data.length - 1)
  const visualHeightBase = (height - padding * 2) * verticalScale

  const points = data
    .map((d, i) => {
      if (d.value === undefined || i > todayIndex) return null
      const plotted = d.value / scaleFactor
      const x = padding + i * stepX
      const y =
        height - padding - ((plotted - min) / (max - min)) * visualHeightBase
      return `${x},${y}`
    })
    .filter(Boolean)
    .join(' ')

  const pointsArray = data
    .map((d, i) => {
      if (d.value === undefined || i > todayIndex) return null
      const plotted = d.value / scaleFactor
      const x = padding + i * stepX
      const y =
        height - padding - ((plotted - min) / (max - min)) * visualHeightBase
      return { x, y, value: d.value, index: i }
    })
    .filter(Boolean) as { x: number; y: number; value: number; index: number }[]

  const onLayout = (event: LayoutChangeEvent) => {
    const { width: layoutWidth } = event.nativeEvent.layout
    setWidth(layoutWidth)
  }

  return (
    <View style={styles.container} onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Polyline
            points={points}
            fill="none"
            stroke={theme.colors.black}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />
          {pointsArray.map((p) => (
            <React.Fragment key={p.index}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={backgroundColor || theme.colors.accentYellow}
                stroke={theme.colors.black}
                strokeWidth={1}
              />
              <SvgText
                x={p.x}
                y={p.y - 8}
                fontSize={10}
                fill={theme.colors.textPrimary}
                textAnchor="middle"
              >
                {String(p.value)}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>
      )}

      <View style={[styles.labelsRow, { width }]}>
        {data.map((d, i) => (
          <Text
            variant={i === todayIndex ? 'medium' : 'small'}
            key={`${d.day}-${i}`}
            style={[styles.label, i === todayIndex && styles.labelActive]}
          >
            {d.day}
          </Text>
        ))}
      </View>
      <Text
        variant="small"
        style={{ alignSelf: 'flex-end', marginTop: 4, opacity: 0.4 }}
      >
        tempo gasto
      </Text>
    </View>
  )
}

const createStyles = (theme: ThemeType, backgroundColor?: string) =>
  StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: theme.spacings.medium,
    },
    labelsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    label: {
      color: '#9B7F90',
    },
    labelActive: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
      backgroundColor: backgroundColor || theme.colors.accentYellow,
      borderRadius: 99,
      paddingHorizontal: 6,
      borderWidth: 1,
      borderColor: theme.colors.black,
    },
  })
