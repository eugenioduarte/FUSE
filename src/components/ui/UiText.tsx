import React from 'react'
import { Text as RNText, TextProps, TextStyle } from 'react-native'
import { Colors, textWeight, typography } from '../../constants/theme'

type Variant = keyof typeof typography

type Props = TextProps & {
  variant?: Variant
  weight?: keyof typeof textWeight
  color?: string
  includeFontPadding?: boolean
}

export const Text: React.FC<Props> = ({
  variant = 'medium',
  weight,
  color,
  includeFontPadding,
  style,
  ...rest
}) => {
  const base = typography[variant]
  const computedStyle: TextStyle = {
    ...base,
    color: color ?? Colors.light.textPrimary,
    fontFamily: weight ? textWeight[weight] : base.fontFamily,
  }

  const rnProps: any = { ...(rest as any) }
  if (includeFontPadding !== undefined)
    rnProps.includeFontPadding = includeFontPadding

  return <RNText {...rnProps} style={[computedStyle, style]} />
}

export default Text
