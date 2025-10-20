import React from 'react'
import { Text as RNText, TextProps, TextStyle } from 'react-native'

type Props = TextProps & {
  variant?: 'title' | 'body' | 'caption'
}

const stylesByVariant: Record<NonNullable<Props['variant']>, TextStyle> = {
  title: { fontSize: 18, fontWeight: '700', color: '#000' },
  body: { fontSize: 14, color: '#000' },
  caption: { fontSize: 12, color: '#000' },
}

export const Text: React.FC<Props> = ({ variant = 'body', style, ...rest }) => {
  return <RNText {...rest} style={[stylesByVariant[variant], style]} />
}

export default Text
