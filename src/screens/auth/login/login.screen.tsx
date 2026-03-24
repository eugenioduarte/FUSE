import { Button, LinkButton, Text, TextInput } from '@/components'
import LoginScreenAnimatedTitle from '@/components/auth/login-animated-title'
import Container from '@/components/containers/container/container'
import { useTheme } from '@/hooks/use-theme'
import { useUpdateBackgroundColor } from '@/hooks/use-update-background-color'
import { t } from '@/locales/translation'
import { firebaseLogin } from '@/services/firebase/auth.service'
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
import { navigatorManager } from '@/navigation/navigator-manager'
import { useAuthStore } from '../../../store/auth.store'
import { useLoginAnimation } from './login-animation.hook'
import { loginSchema } from './login.schema'

type LoginFormValues = {
  email: string
  password: string
}

const LoginScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const loginStore = useAuthStore((s) => s.login)

  const { control, handleSubmit, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'eugenioduartesilva@gmail.com',
      password: '123456',
    },
  })

  const { isSubmitting, errors } = formState
  const { translateY, keyboardOpen } = useLoginAnimation(theme)

  useUpdateBackgroundColor(theme.colors.backgroundSecondary)

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res: any = await firebaseLogin(values.email, values.password)
      const u = res.user
      loginStore({ id: u.uid, name: u.email ?? t('user.default') })
      navigatorManager.goToDashboard()
    } catch (err: any) {
      Alert.alert(t('login.failed'), err?.message ?? String(err))
    }
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
              <Text variant="xxLarge">{t('login.title')}</Text>
              <Text variant="xLarge" style={styles.subtitle}>
                {t('login.subtitle')}
              </Text>

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    placeholder={t('login.email')}
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
                    placeholder={t('login.password')}
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
                  title={t('register.button')}
                  onPress={() => navigatorManager.goToRegister()}
                  disabled={isSubmitting}
                  style={styles.button}
                  background={theme.colors.accentYellow}
                  textColor={theme.colors.black}
                />
                <Button
                  title={t('login.button')}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.button}
                  background={theme.colors.accentYellow}
                  textColor={theme.colors.black}
                  disabled={isSubmitting}
                />
              </View>

              <LinkButton
                text={t('login.forgot_password')}
                textColor={theme.colors.textPrimary}
                variant="large"
                onPress={() => navigatorManager.goToRecovery()}
              />
            </Animated.View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Container>
  )
}

export default LoginScreen

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
