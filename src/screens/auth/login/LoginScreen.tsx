import { Button, LinkButton, Text, TextInput } from '@/src/components'
import Container from '@/src/components/containers/Container'

import { useTheme } from '@/src/hooks/useTheme'
import { loginSchema } from '@/src/schemas/authSchemas'
import { firebaseLogin } from '@/src/services/firebase/authService'
import { ThemeType } from '@/src/types/theme.type'
import React, { useState } from 'react'
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
import { useAuthStore } from '../../../store/useAuthStore'
import LoginScreenAnimatedTitle from './LoginScreenAnimatedTitle'
import { useLoginAnimation } from './useLoginAnimation'

const LoginScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const loginStore = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('eugenioduartesilva@gmail.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  const { translateY, keyboardOpen } = useLoginAnimation(theme)

  const validate = () => {
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const msg = result.error.issues.map((e) => e.message).join('\n')
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
                editable={!loading}
              />

              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
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
