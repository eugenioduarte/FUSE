import { Button, Container, Text, TextInput } from '@/components'
import { useSnackbar } from '@/components/snackbar-provider/SnackbarProvider'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { RecoverySchema, recoverySchema } from '@/schemas/authSchemas'
import { ThemeType } from '@/types/theme.type'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { firebaseSendPasswordReset } from '../../../services/firebase/authService'
import LoginScreenAnimatedTitle from '../login/LoginScreenAnimatedTitle'
import { useLoginAnimation } from '../login/useLoginAnimation'

export default function RecoveryPasswordScreen() {
  const { showSnackbar } = useSnackbar()
  const theme = useTheme()
  const styles = createStyles(theme)
  const { translateY, keyboardOpen } = useLoginAnimation(theme)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RecoverySchema>({
    resolver: zodResolver(recoverySchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const translations = {
    title: t('recovery.title'),
    subtitle: t('recovery.subtitle'),
    emailPlaceholder: t('register.email'),
    sendButton: t('recovery.send_button'),
    goBackButton: t('common.goBack'),
    alertSuccessMessage: t('recovery.success_message'),
    alertErrorTitle: t('recovery.error_title'),
  }

  const onSend = async (values: RecoverySchema) => {
    try {
      await firebaseSendPasswordReset(values.email)
      showSnackbar(translations.alertSuccessMessage, 'success')
      navigatorManager.goToLoginScreen()
    } catch {
      showSnackbar(translations.alertErrorTitle, 'error')
    }
  }

  const handleGoBack = () => {
    navigatorManager.goToLoginScreen()
  }

  return (
    <Container style={styles.container}>
      <LoginScreenAnimatedTitle keyboardOpen={keyboardOpen} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            <Animated.View
              style={[
                styles.animatedBlock,
                {
                  transform: [{ translateY }],
                  justifyContent: keyboardOpen ? 'center' : 'flex-end',
                },
              ]}
            >
              <Text variant="xxLarge">{translations.title}</Text>
              <Text variant="xLarge" style={styles.subtitle}>
                {translations.subtitle}
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder={translations.emailPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                    error={errors.email?.message}
                  />
                )}
              />

              <View style={styles.buttonRow}>
                <Button
                  title={translations.goBackButton}
                  onPress={handleGoBack}
                  disabled={isSubmitting}
                  style={styles.button}
                  background={theme.colors.accentRed}
                  textColor={theme.colors.backgroundPrimary}
                />
                <Button
                  title={translations.sendButton}
                  onPress={handleSubmit(onSend)}
                  disabled={!isValid || isSubmitting}
                  style={styles.button}
                  background={theme.colors.accentRed}
                  textColor={theme.colors.backgroundPrimary}
                />
              </View>
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  )
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      backgroundColor: theme.colors.backgroundTertiary,
    },
    keyboardAvoiding: {
      flex: 1,
      zIndex: 2,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    animatedBlock: {
      backgroundColor: theme.colors.backgroundPrimary,
      padding: theme.spacings.medium,
      borderRadius: theme.border.radius16,
      paddingVertical: theme.spacings.xLarge,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
    },
    subtitle: {
      marginBottom: theme.spacings.large,
      color: theme.colors.textSecondary,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginVertical: theme.spacings.medium,
      gap: theme.spacings.medium,
    },
    button: {
      flex: 1,
    },
  })
