import { Text } from '@/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path, Text as SvgText } from 'react-native-svg'
import useSummaryProgressArcs from '../hooks/useSummaryProgressArcs'
type Item = { title: string; value: number; color: string }
type Props = { data: Item[] }

export function SummaryProgressArcs({ data }: Readonly<Props>) {
  const computed = useSummaryProgressArcs(data)
  if (!data?.length || !computed) return null

  const { theme, size, stroke, borderOffset, cx, cy, items } = computed

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation={-90} origin={`${cx},${cy}`}>
            {items.map((it) => {
              const { item, trackPath, progPath, end, index } = it
              const color = item.color

              return (
                <React.Fragment key={item.title}>
                  {/* Fundo */}
                  <Path
                    d={trackPath}
                    stroke={theme.colors.backgroundTertiary}
                    strokeWidth={stroke}
                    fill="none"
                    strokeLinecap="round"
                  />

                  {/* Borda preta */}
                  <Path
                    d={progPath}
                    stroke={theme.colors.borderColor}
                    strokeWidth={stroke + borderOffset * 2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Arco colorido */}
                  <Path
                    d={progPath}
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
                    r={10}
                    fill={color}
                    stroke={theme.colors.borderColor}
                    strokeWidth={2}
                  />
                  <SvgText
                    x={end.x}
                    y={end.y + 3}
                    fontSize={10}
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
          const fmt = (v: number) =>
            v % 1 === 0 ? `${v.toFixed(0)}h` : `${v.toFixed(1)}h`
          return (
            <View key={item.title} style={styles.legendItem}>
              <View
                style={[styles.legendColor, { backgroundColor: item.color }]}
              >
                <Text variant="small">{index}</Text>
              </View>
              <View>
                <Text
                  variant="medium"
                  style={[{ color: item.color }]}
                  numberOfLines={1}
                >
                  {`${index} - ${item.title.slice(0, 20)}`}
                </Text>
                <Text
                  variant="medium"
                  style={[{ color: item.color, marginTop: -6 }]}
                >
                  {`tempo gasto - ${fmt(item.value)}`}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
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
})
