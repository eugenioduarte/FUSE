import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useMemo, useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../../navigation/navigatorManager'
import { challengesRepository } from '../../../../services/repositories/challenges.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Challenge } from '../../../../types/domain'

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

const ChallengeAddQuizScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeAddQuizScreen'>>()
  const summaryId = (route.params as any)?.summaryId as string | undefined
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  // Form state
  const [name, setName] = useState('')
  const [totalQuestions, setTotalQuestions] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('') // ISO optional
  const [endDate, setEndDate] = useState<string>('') // ISO optional
  const [step, setStep] = useState(0) // 0,1,2

  // Animations: slide X for container
  const slideX = useRef(new Animated.Value(0)).current
  const screenWidth = Dimensions.get('window').width
  const doSlide = (toStep: number) => {
    // Animate 0 -> -screenW -> -2*screenW
    const toValue = -toStep * screenWidth
    Animated.timing(slideX, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }

  const canContinueStep1 = name.trim().length > 0
  const canContinueStep2 = useMemo(() => {
    const n = Number(totalQuestions)
    if (!Number.isFinite(n)) return false
    return n > 0 && n <= 100
  }, [totalQuestions])

  const onContinue = () => {
    const next = Math.min(step + 1, 2)
    setStep(next)
    doSlide(next)
  }

  const onBack = () => {
    const prev = Math.max(step - 1, 0)
    setStep(prev)
    doSlide(prev)
  }

  const onFinish = async () => {
    if (!summaryId) {
      setErrorOverlay(
        true,
        'Abra a criação de challenge a partir de um Summary.',
      )
      return
    }
    try {
      setLoadingOverlay(true)
      const now = Date.now()
      const id = `${now}`
      const payload = {
        totalQuestions: Number(totalQuestions),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }
      const challenge: Challenge = {
        id,
        type: 'quiz',
        title: name.trim(),
        summaryId: summaryId,
        payload,
        createdAt: now,
        updatedAt: now,
      }
      await challengesRepository.upsert(challenge, '/sync/challenge', {
        summaryId: summaryId,
      })
      setLoadingOverlay(false)
      // Redirect to list for this summary
      navigatorManager.goToChallengesList({ summaryId })
    } catch (e: any) {
      setLoadingOverlay(false)
      console.error(e)
      setErrorOverlay(
        true,
        'Não foi possível criar o challenge. Tente novamente em instantes.',
      )
    }
  }

  const slideStyle = {
    flexDirection: 'row' as const,
    width: screenWidth * 3,
    transform: [{ translateX: slideX }],
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0b0b0c' }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Header with progress and back when not first step */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {step > 0 && (
            <TouchableOpacity onPress={onBack} style={{ marginRight: 12 }}>
              <Text style={{ color: '#60a5fa' }}>Voltar</Text>
            </TouchableOpacity>
          )}
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
            Criar Quiz
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <StepDot active={step === 0} />
          <StepDot active={step === 1} />
          <StepDot active={step === 2} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', overflow: 'hidden' }}>
          <Animated.View style={slideStyle as any}>
            {/* Step 1 */}
            <View style={{ width: screenWidth, paddingHorizontal: 16 }}>
              <Text
                style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}
              >
                Nome do challenge
              </Text>
              <TextInput
                placeholder="Ex.: Quiz de revisão"
                placeholderTextColor="#6b7280"
                value={name}
                onChangeText={setName}
                style={{
                  backgroundColor: '#111214',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  color: 'white',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />
              <View style={{ height: 16 }} />
              <TouchableOpacity
                disabled={!canContinueStep1}
                onPress={onContinue}
                style={{
                  backgroundColor: canContinueStep1 ? '#3b82f6' : '#1f2937',
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Continuar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 2 */}
            <View style={{ width: screenWidth, paddingHorizontal: 16 }}>
              <Text
                style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}
              >
                Número de perguntas
              </Text>
              <TextInput
                placeholder="Ex.: 10"
                placeholderTextColor="#6b7280"
                keyboardType="number-pad"
                value={totalQuestions}
                onChangeText={setTotalQuestions}
                style={{
                  backgroundColor: '#111214',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  color: 'white',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />
              <View style={{ height: 12 }} />
              <Text style={{ color: '#9ca3af', marginBottom: 8 }}>
                Datas (opcional)
              </Text>
              <TextInput
                placeholder="Início (YYYY-MM-DD)"
                placeholderTextColor="#6b7280"
                value={startDate}
                onChangeText={setStartDate}
                style={{
                  backgroundColor: '#111214',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  color: 'white',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  marginBottom: 8,
                }}
              />
              <TextInput
                placeholder="Fim (YYYY-MM-DD)"
                placeholderTextColor="#6b7280"
                value={endDate}
                onChangeText={setEndDate}
                style={{
                  backgroundColor: '#111214',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  color: 'white',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              />

              <View style={{ height: 16 }} />
              <TouchableOpacity
                disabled={!canContinueStep2}
                onPress={onContinue}
                style={{
                  backgroundColor: canContinueStep2 ? '#3b82f6' : '#1f2937',
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Continuar
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 3 - Confirm */}
            <View style={{ width: screenWidth, paddingHorizontal: 16 }}>
              <Text
                style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}
              >
                Confirmar
              </Text>
              <View
                style={{
                  backgroundColor: '#111214',
                  borderColor: '#2B2C30',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Row label="Nome" value={name || '-'} />
                <Row label="Perguntas" value={totalQuestions || '-'} />
                <Row label="Início" value={startDate || '-'} />
                <Row label="Fim" value={endDate || '-'} />
              </View>
              <View style={{ height: 16 }} />
              <TouchableOpacity
                onPress={onFinish}
                style={{
                  backgroundColor: '#10b981',
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Finalizar
                </Text>
              </TouchableOpacity>
              <View style={{ height: 12 }} />
              <TouchableOpacity
                disabled
                style={{
                  backgroundColor: '#1f2937',
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#9ca3af', fontWeight: '600' }}>
                  Adicionar utilizadores (em breve)
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <View
    style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    }}
  >
    <Text style={{ color: '#9ca3af' }}>{label}</Text>
    <Text style={{ color: 'white', fontWeight: '600' }}>{value}</Text>
  </View>
)

export default ChallengeAddQuizScreen
