import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'

const ChallengeAddScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ChallengeAddScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
        Tipo de Challenge
      </Text>
      <View style={{ height: 16 }} />

      <Option
        label="Quiz"
        onPress={() => navigatorManager.goToChallengeAddQuiz({ summaryId })}
      />
      <Option
        label="Hangman"
        onPress={() => navigatorManager.goToChallengeAddHangman({ summaryId })}
      />
      <Option
        label="Matrix"
        onPress={() => navigatorManager.goToChallengeAddMatrix({ summaryId })}
      />
      <Option
        label="Flashcard"
        onPress={() =>
          navigatorManager.goToChallengeAddFlashCard({ summaryId })
        }
      />
      <Option
        label="Resposta em Texto"
        onPress={() =>
          navigatorManager.goToChallengeAddTextAnswer({ summaryId })
        }
      />
    </View>
  )
}

export default ChallengeAddScreen

const Option = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: '#111214',
      borderColor: '#2B2C30',
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 16,
      paddingHorizontal: 14,
      marginBottom: 12,
    }}
  >
    <Text style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>
      {label}
    </Text>
  </TouchableOpacity>
)
