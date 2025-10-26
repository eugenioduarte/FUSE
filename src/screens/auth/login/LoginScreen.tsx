import { Button, LinkButton, Text, TextInput } from '@/src/components'
import Container from '@/src/components/containers/Container'
import { useTheme } from '@/src/hooks/useTheme'
import { loginSchema } from '@/src/schemas/authSchemas'
import { firebaseLogin } from '@/src/services/firebase/authService'
import { ThemeType } from '@/src/types/theme.type'
import React, { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  EmitterSubscription,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { useAuthStore } from '../../../store/useAuthStore'
import LoginScreenAnimatedTitle from './LoginScreenAnimatedTitle'

const LoginScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const animatedTitleSize = useRef(new Animated.Value(100)).current
  const animatedTitleMargin = useRef(
    new Animated.Value(theme.spacings.large),
  ).current
  const loginStore = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('eugenioduartesilva@gmail.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  const translateY = useRef(new Animated.Value(0)).current
  const [keyboardOpen, setKeyboardOpen] = useState(false)

  useEffect(() => {
    let showSub: EmitterSubscription | undefined
    let hideSub: EmitterSubscription | undefined

    showSub = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardOpen(true)
      Animated.timing(translateY, {
        toValue: -80,
        duration: 300,
        useNativeDriver: true,
      }).start()
      Animated.timing(animatedTitleSize, {
        toValue: 40,
        duration: 300,
        useNativeDriver: false,
      }).start()
      Animated.timing(animatedTitleMargin, {
        toValue: theme.spacings.small,
        duration: 300,
        useNativeDriver: false,
      }).start()
    })

    hideSub = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardOpen(false)
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
      Animated.timing(animatedTitleSize, {
        toValue: 100,
        duration: 300,
        useNativeDriver: false,
      }).start()
      Animated.timing(animatedTitleMargin, {
        toValue: theme.spacings.large,
        duration: 300,
        useNativeDriver: false,
      }).start()
    })

    return () => {
      showSub?.remove()
      hideSub?.remove()
    }
  }, [translateY, animatedTitleSize, animatedTitleMargin, theme])

  const validate = () => {
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const msg = result.error.issues
        .map((e: { message: string }) => e.message)
        .join('\n')
      Alert.alert('Validation', msg)
      return false
    }
    return true
  }

  const onLogin = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      const res: any = await firebaseLogin(email, password)
      const u = res.user
      loginStore({ id: u.uid, name: u.email ?? 'User' })
      navigatorManager.goToDashboard()
    } catch (err: any) {
      Alert.alert('Login failed', err?.message ?? String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container style={styles.container}>
      <LoginScreenAnimatedTitle />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
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
              <Text variant="xxLarge">Login</Text>
              <Text variant="xLarge" style={styles.subtitle}>
                Please Sign in to continue.
              </Text>

              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                testID="email-input"
                accessibilityLabel="email-input"
                editable={!loading}
              />

              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="password-input"
                accessibilityLabel="password-input"
                editable={!loading}
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Login"
                  onPress={onLogin}
                  style={styles.button}
                  background={theme.colors.accentRed}
                  textColor={theme.colors.backgroundPrimary}
                  disabled={loading}
                />
                <Button
                  title="Register"
                  onPress={() => navigatorManager.goToRegister()}
                  disabled={loading}
                  style={styles.button}
                  background={theme.colors.accentRed}
                  textColor={theme.colors.backgroundPrimary}
                />
              </View>

              <LinkButton
                text="Forgot password?"
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
    title: {
      fontSize: 100,
      lineHeight: 100,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: theme.spacings.large,
    },
    titleSmall: {
      fontSize: 40,
      lineHeight: 44,
      fontWeight: 'bold',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: theme.spacings.small,
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
