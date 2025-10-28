import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import {
  StyleSheet,
  Text,
  TextInputProps,
  TextInput as TextInputRN,
  View,
} from 'react-native'

type Props = TextInputProps & {
  testID?: string
  accessibilityLabel?: string
  error?: string
}

const TextInput: React.FC<Props> = ({
  style,
  testID = 'text-input',
  accessibilityLabel = 'text-input',
  error,
  ...props
}) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  return (
    <View style={styles.wrapper}>
      <TextInputRN
        style={[
          {
            fontFamily: theme.typography.large.fontFamily,
            borderColor: error
              ? theme.colors.accentRed
              : theme.colors.borderColor,
          },
          styles.input,
          style,
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

export default TextInput

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
      marginBottom: theme.spacings.medium,
    },
    input: {
      height: 48,
      borderWidth: 2,
      borderRadius: 999,
      paddingHorizontal: 12,
      fontSize: 16,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    errorText: {
      color: theme.colors.accentRed,
      fontSize: 13,
      marginTop: 4,
      fontFamily: theme.typography.small.fontFamily,
    },
  })
