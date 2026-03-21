import { useThemeStore } from '@/store/useThemeStore'
import React, { useState } from 'react'
import { Pressable, View } from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'

const SIZE = 200
const CENTER = SIZE / 2
const STROKE = 20
const RADIUS = (SIZE - STROKE) / 2

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const theta = angle * (Math.PI / 180)

  return {
    x: cx + r * Math.cos(theta),
    y: cy + r * Math.sin(theta),
  }
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, startAngle - 90)
  const end = polarToCartesian(cx, cy, r, endAngle - 90)

  return `M ${start.x} ${start.y}
          A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
}

function angleToColor(angle: number) {
  return `hsl(${Math.round(angle)}, 100%, 50%)`
}

export function ColorWheel() {
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const [selectedColor, setSelectedColor] = useState(color)

  const handlePress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent

    const x = locationX - CENTER
    const y = locationY - CENTER

    const distance = Math.hypot(x, y)

    if (distance < RADIUS - STROKE / 2 || distance > RADIUS + STROKE / 2) {
      return
    }

    const angle = Math.atan2(y, x)
    const deg = ((angle * 180) / Math.PI + 450) % 360

    const color = angleToColor(deg)

    setSelectedColor(color)

    try {
      useThemeStore.setState({ colorLevelUp: { background_color: color } })
    } catch {}
    console.log('Cor:', color)
  }

  const segments = []
  const step = 1.5

  for (let angle = 0; angle < 360; angle += step) {
    const d = describeArc(CENTER, CENTER, RADIUS, angle, angle + step)
    const color = angleToColor(angle)

    segments.push(
      <Path
        key={`seg-${angle}`}
        d={d}
        stroke={color}
        strokeWidth={STROKE}
        fill="none"
      />,
    )
  }

  return (
    <Pressable onPressIn={handlePress}>
      <View>
        <Svg width={SIZE} height={SIZE}>
          {segments}

          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS - STROKE}
            fill={selectedColor}
          />
        </Svg>
      </View>
    </Pressable>
  )
}
