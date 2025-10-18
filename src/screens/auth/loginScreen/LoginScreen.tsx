import { firebaseLogin } from '@/src/services/firebase/authService'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { useAuthStore } from '../../../store/useAuthStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginScreen: React.FC = () => {
  const loginStore = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('eugenioduartesilva@gmail.com')
  const [password, setPassword] = useState('123456')
  const [loading, setLoading] = useState(false)

  const validate = () => {
    if (!email || !password) {
      Alert.alert('Validation', 'Preencha email e senha')
      return false
    }
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert('Validation', 'Digite um email válido')
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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        editable={!loading}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        editable={!loading}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0a84ff" />
      ) : (
        <Button title="Login" onPress={onLogin} />
      )}

      <View style={{ height: 12 }} />
      <Button
        title="Register"
        onPress={() => navigatorManager.goToRegister()}
        disabled={loading}
      />
      <View style={{ height: 8 }} />
      <Button
        title="Forgot password?"
        onPress={() => navigatorManager.goToRecovery()}
        disabled={loading}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 12 },
  input: { borderWidth: 1, padding: 8, marginBottom: 8, borderRadius: 6 },
})

export default LoginScreen
