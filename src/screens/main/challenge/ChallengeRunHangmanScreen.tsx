import {
  navigatorManager,
  RootStackParamList,
} from '@/navigation/navigatorManager'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'
import useChallengeRunHangman from './hooks/useChallengeRunHangman'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const StepDot = ({ active }: { active: boolean }) => (
  <View
    style={{
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 4,
      backgroundColor: active ? '#60a5fa' : '#374151',
    }}
  />
)

const ChallengeRunHangmanScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunHangmanScreen'>>()
  const challengeId = route.params?.challengeId!

  const {
    loading,
    topicColor,
    challenge,
    rounds,
    step,
    revealed,
    letters,
    wrongs,
    maxWrongs,
    canContinue,
    isLast,
    screenWidth,
    slideX,
    onGuess,
    onContinue,
    forceFinish,
    finished,
  } = useChallengeRunHangman(challengeId)

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: topicColor || '#0b0b0c',
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (!challenge || rounds.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: topicColor || '#0b0b0c',
          padding: 16,
        }}
      >
        <Text style={{ color: topicColor ? '#111' : 'white' }}>
          Hangman indisponível.
        </Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: topicColor || '#0b0b0c' }}>
      <ChallengeRunClose onConfirm={forceFinish} />

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: topicColor ? '#111' : 'white',
            fontSize: 18,
            fontWeight: '700',
          }}
        >
          {challenge.title}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {rounds.map((r, i) => (
            <StepDot key={`${i}-${r.word}`} active={i === step} />
          ))}
        </View>
      </View>

      {finished ? (
        <View
          style={{ flex: 1, paddingHorizontal: 16, justifyContent: 'center' }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Resultado
          </Text>
          <Text style={{ color: '#e5e7eb', textAlign: 'center' }}>
            Você marcou {finished.score} de {finished.total}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          <View style={{ width: '100%', overflow: 'hidden' }}>
            <Animated.View
              style={{
                width: screenWidth * rounds.length,
                flexDirection: 'row',
                transform: [{ translateX: slideX }],
              }}
            >
              {rounds.map((r, idx) => (
                <View
                  key={`${idx}-${r.word}`}
                  style={{ width: screenWidth, paddingHorizontal: 16 }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      marginBottom: 8,
                    }}
                  >{`Desafio ${idx + 1}/${rounds.length}`}</Text>

                  <Text style={{ color: '#e5e7eb', marginBottom: 8 }}>
                    {idx === step ? rounds[step]?.question : '—'}
                  </Text>

                  <View
                    style={{
                      backgroundColor: '#111214',
                      borderColor: '#2B2C30',
                      borderWidth: 1,
                      borderRadius: 10,
                      padding: 16,
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{ color: 'white', fontSize: 24, letterSpacing: 2 }}
                    >
                      {idx === step
                        ? revealed
                        : r.word
                            .split('')
                            .map(() => '_ ')
                            .join('')
                            .trim()}
                    </Text>
                    <Text style={{ color: '#9ca3af', marginTop: 8 }}>
                      Erros: {idx === step ? wrongs : 0}/{maxWrongs}
                    </Text>
                  </View>

                  {idx === step && (
                    <View
                      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}
                    >
                      {ALPHABET.map((ch) => {
                        const pressed = letters.has(ch)
                        return (
                          <TouchableOpacity
                            key={ch}
                            disabled={pressed || canContinue}
                            onPress={() => onGuess(ch)}
                            style={{
                              paddingVertical: 10,
                              paddingHorizontal: 12,
                              borderRadius: 6,
                              backgroundColor: pressed ? '#1f2937' : '#3b82f6',
                              opacity: pressed || canContinue ? 0.6 : 1,
                            }}
                          >
                            <Text style={{ color: 'white', fontWeight: '700' }}>
                              {ch}
                            </Text>
                          </TouchableOpacity>
                        )
                      })}
                    </View>
                  )}
                </View>
              ))}
            </Animated.View>
          </View>
        </ScrollView>
      )}

      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {finished ? (
          <TouchableOpacity
            onPress={() =>
              navigatorManager.goToChallengesList({
                summaryId: challenge.summaryId,
              })
            }
            style={{
              backgroundColor: '#10b981',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              Voltar para a lista
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={!canContinue}
            onPress={onContinue}
            style={{
              backgroundColor: canContinue ? '#3b82f6' : '#1f2937',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {isLast && canContinue ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export default ChallengeRunHangmanScreen
