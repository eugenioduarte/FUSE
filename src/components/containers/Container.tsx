import { isColorDark } from '@/utils/colorUtils'
import { useFocusEffect } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { StatusBar, View, ViewProps } from 'react-native'
import { Colors } from '../../constants/theme'
import { useThemeStore } from '../../store/useThemeStore'

type ContainerProps = {
  children: React.ReactNode
  style?: ViewProps['style']
} & ViewProps

const Container = ({ children, style, ...props }: ContainerProps) => {
  const setBackgroundColor = useThemeStore((state) => state.setBackgroundColor)
  let bgColor = Colors.light.backgroundPrimary
  let paddingTop = 0

  if (style) {
    const stylesArray = Array.isArray(style) ? style : [style]
    for (const s of stylesArray) {
      if (s && typeof s === 'object') {
        if ('backgroundColor' in s && typeof s.backgroundColor === 'string') {
          bgColor = s.backgroundColor
        }
        if ('paddingTop' in s && typeof s.paddingTop === 'number') {
          paddingTop = s.paddingTop
        }
      }
    }
  }

  console.log('Container background color:', bgColor)
  const dark = isColorDark(bgColor)

  useFocusEffect(
    React.useCallback(() => {
      setBackgroundColor(bgColor)
    }, [bgColor, setBackgroundColor]),
  )

  useEffect(() => {
    setBackgroundColor(bgColor)
  }, [bgColor, setBackgroundColor])

  return (
    <View
      style={[{ flex: 1, backgroundColor: bgColor, paddingTop }, style]}
      {...props}
    >
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={bgColor}
      />
      {children}
    </View>
  )
}

export default Container
