import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useRef } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import ChallengeRunClose from './components/ChallengeRunClose'
import { useChallengeRunQuiz } from './hooks/useChallengeRunQuiz'

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

const ChallengeRunQuizScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunQuizScreen'>>()
  const challengeId = route.params?.challengeId!

  const {
    challenge,
    questions,
    loading,
    topicColor,
    step,
    finished,
    currentChoice,
    isLast,
    canContinue,
    onSelect,
    onContinue,
    forceFinish,
  } = useChallengeRunQuiz(challengeId)

  const screenWidth = Dimensions.get('window').width
  const slideX = useRef(new Animated.Value(0)).current
  const doSlide = (to: number) => {
    Animated.timing(slideX, {
      toValue: -to * screenWidth,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }

  const handleContinue = async () => {
    if (!canContinue) return
    const next = step + 1
    if (next < questions.length) doSlide(next)
    await onContinue()
  }

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

  if (!challenge || questions.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: topicColor || '#0b0b0c',
          padding: 16,
        }}
      >
        <Text style={{ color: topicColor ? '#111' : 'white' }}>
          Quiz indisponível.
        </Text>
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: topicColor || '#0b0b0c',
        paddingTop: 50,
      }}
    >
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
          {questions.map((q, i) => (
            <StepDot key={`${i}-${q.question}`} active={i === step} />
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
                width: screenWidth * questions.length,
                flexDirection: 'row',
                transform: [{ translateX: slideX }],
              }}
            >
              {questions.map((q, idx) => (
                <View
                  key={`${idx}-${q.question}`}
                  style={{ width: screenWidth, paddingHorizontal: 16 }}
                >
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      marginBottom: 12,
                    }}
                  >{`Pergunta ${idx + 1}/${questions.length}`}</Text>
                  <Text style={{ color: '#e5e7eb', marginBottom: 12 }}>
                    {q.question}
                  </Text>
                  <View style={{ gap: 10 }}>
                    {q.options.map((opt, oi) => {
                      const selected = currentChoice === oi
                      const isCorrect = opt.correct
                      const bg = selected
                        ? isCorrect
                          ? '#14532d'
                          : '#7f1d1d'
                        : '#111214'
                      const border = selected
                        ? isCorrect
                          ? '#22c55e'
                          : '#ef4444'
                        : '#2B2C30'
                      return (
                        <View key={`${idx}-${oi}-${opt.text}`}>
                          <TouchableOpacity
                            onPress={() => onSelect(oi)}
                            style={{
                              backgroundColor: bg,
                              borderColor: border,
                              borderWidth: 1,
                              borderRadius: 10,
                              padding: 12,
                            }}
                          >
                            <Text style={{ color: 'white' }}>{opt.text}</Text>
                          </TouchableOpacity>
                          {selected && (
                            <Text style={{ color: '#9ca3af', marginTop: 6 }}>
                              {opt.explanation}
                            </Text>
                          )}
                        </View>
                      )
                    })}
                  </View>
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
            onPress={handleContinue}
            style={{
              backgroundColor: canContinue ? '#3b82f6' : '#1f2937',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {isLast ? 'Finalizar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

// Helpers moved into hook. Screen only renders UI now.

export default ChallengeRunQuizScreen
