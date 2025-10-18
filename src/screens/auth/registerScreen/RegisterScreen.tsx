import React, { useState } from 'react'
import { Alert, Button, Text, TextInput, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { firebaseRegister } from '../../../services/firebase/authService'
import { useAuthStore } from '../../../store/useAuthStore'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginStore = useAuthStore((s) => s.login)

  const onRegister = async () => {
    try {
      const res: any = await firebaseRegister(email, password)
      const u = res.user
      loginStore({ id: u.uid, name: u.email ?? 'User' })
      navigatorManager.goToDashboard()
    } catch (err: any) {
      Alert.alert('Register failed', err?.message ?? String(err))
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>Register</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginBottom: 12 }}
      />
      <Button title="Create account" onPress={onRegister} />
    </View>
  )
}
