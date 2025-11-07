import { Button } from '@/components'
import { t } from '@/locales/translation'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { useThemeStore } from '@/store/useThemeStore'
import { RouteProp, useRoute } from '@react-navigation/native'
import React from 'react'
import { BackHandler, Text, View } from 'react-native'

const ChallengeFinishedScoreScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeFinishedScoreScreen'>>()
  const score = route.params?.score ?? 0
  const total = route.params?.total ?? 0

  const setHeaderConfig = useThemeStore((s) => s.setHeaderConfig)
  React.useEffect(() => {
    setHeaderConfig('ChallengeFinishedScoreScreen')
  }, [setHeaderConfig])

  React.useEffect(() => {
    const onBack = () => {
      navigatorManager.goToChallengesList()
      return true
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack)
    return () => sub.remove()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>ChallengeFinishedScoreScreen</Text>
      <Text>
        {t('challengeFinished.you_scored')
          .replace('{score}', String(score))
          .replace('{total}', String(total))}
      </Text>
      <View style={{ marginTop: 16 }}>
        <Button
          title={t('common.goBack')}
          onPress={() => navigatorManager.goToChallengesList()}
        />
      </View>
    </View>
  )
}

export default ChallengeFinishedScoreScreen
