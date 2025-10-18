import React, { useState } from 'react'
import { Alert, Button, Text, TextInput, View } from 'react-native'
import { navigatorManager } from '../../../navigation/navigatorManager'
import { firebaseSendPasswordReset } from '../../../services/firebase/authService'

const RecoveryPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('')

  const onSend = async () => {
    try {
      await firebaseSendPasswordReset(email)
      Alert.alert(
        'Sent',
        'If an account exists, you will receive an email with reset instructions.',
      )
      navigatorManager.goToLoginScreen()
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? String(err))
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 12 }}>Reset password</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 8, marginBottom: 8 }}
      />
      <Button title="Send reset email" onPress={onSend} />
    </View>
  )
}

export default RecoveryPasswordScreen
