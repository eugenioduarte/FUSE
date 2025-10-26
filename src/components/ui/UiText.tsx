import React from 'react'
import { Text as RNText, TextProps, TextStyle } from 'react-native'
import { Colors, textWeight, typography } from '../../constants/theme'

type Variant = keyof typeof typography

type Props = TextProps & {
  variant?: Variant
  weight?: keyof typeof textWeight
  color?: string
}

export const Text: React.FC<Props> = ({
  variant = 'medium',
  weight,
  color,
  style,
  ...rest
}) => {
  const base = typography[variant]
  const computedStyle: TextStyle = {
    ...base,
    color: color ?? Colors.light.textPrimary,
    fontFamily: weight ? textWeight[weight] : base.fontFamily,
  }

  return <RNText {...rest} style={[computedStyle, style]} />
}

export default Text
