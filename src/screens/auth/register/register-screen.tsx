import { Button, Container, Text, TextInput } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { registerSchema, RegisterSchema } from '@/schemas/authSchemas'
import { ThemeType } from '@/types/theme.type'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Alert,
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
import { firebaseRegister } from '../../../services/firebase/authService'
import { useAuthStore } from '../../../store/useAuthStore'
import LoginScreenAnimatedTitle from '../login/login-screen-animated-title'
import { useLoginAnimation } from '../login/use-login-animation'

export default function RegisterScreen() {
  const theme = useTheme()
  const styles = createStyles(theme)
  const loginStore = useAuthStore((s) => s.login)
  const { translateY, keyboardOpen } = useLoginAnimation(theme)

  const translations = {
    title: t('register.title'),
    subtitle: t('register.subtitle'),
    emailPlaceholder: t('register.email'),
    passwordPlaceholder: t('register.password'),
    goBackButton: t('common.goBack'),
    registerButton: t('register.button'),
    alertFailedTitle: t('register.failed_title'),
    alertFailedMessage: t('register.failed_message'),
  }

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const onSubmit = async (values: RegisterSchema) => {
    try {
      const res: any = await firebaseRegister(values.email, values.password)
      const u = res.user
      loginStore({ id: u.uid })
      navigatorManager.goToDashboard()
    } catch (err: any) {
      Alert.alert(
        translations.alertFailedTitle,
        err?.message ?? translations.alertFailedMessage,
      )
    }
  }

  const handleGoBack = () => navigatorManager.goToLoginScreen()

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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder={translations.passwordPlaceholder}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    editable={!isSubmitting}
                    error={errors.password?.message}
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
                  title={translations.registerButton}
                  onPress={handleSubmit(onSubmit)}
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
