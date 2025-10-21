import React from 'react'
import { Text as RNText, TextProps, TextStyle } from 'react-native'
import { Colors, textWeight, typography } from '../../constants/theme'

type Variant = keyof typeof typography

type Props = TextProps & {
  variant?: Variant | 'title' | 'body' | 'caption'
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
  const variantKey: Variant =
    variant === 'title'
      ? 'xLarge'
      : variant === 'body'
        ? 'medium'
        : variant === 'caption'
          ? 'small'
          : variant

  const base = typography[variantKey]
  const computedStyle: TextStyle = {
    ...base,
    color: color ?? Colors.light.text,
    fontFamily: weight ? textWeight[weight] : base.fontFamily,
  }

  return <RNText {...rest} style={[computedStyle, style]} />
}

export default Text
