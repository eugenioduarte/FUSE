import { useTheme } from '@/src/hooks/useTheme'
import { ThemeType } from '@/src/types/theme.type'
import React from 'react'
import {
  StyleSheet,
  TextInputProps,
  TextInput as TextInputRN,
} from 'react-native'

type Props = TextInputProps & {
  testID?: string
  accessibilityLabel?: string
}

const TextInput: React.FC<Props> = ({
  style,
  testID = 'text-input',
  accessibilityLabel = 'text-input',
  ...props
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <TextInputRN
      style={[
        {
          fontFamily: theme.typography.large.fontFamily,
        },
        styles.input,
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    />
  )
}

export default TextInput

const createStyles = (theme: ThemeType) => {
  return StyleSheet.create({
    input: {
      height: 48,
      borderColor: theme.colors.borderColor,
      borderWidth: 2,
      borderRadius: 999,
      paddingHorizontal: 12,
      fontSize: 16,
      backgroundColor: theme.colors.backgroundSecondary,
      marginBottom: theme.spacings.medium,
    },
  })
}
