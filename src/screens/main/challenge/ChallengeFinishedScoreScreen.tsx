import { Button } from '@/components'
import EmptyContainer from '@/components/containers/empty-container/EmptyContainer'
import { t } from '@/locales/translation'
import {
  RootStackParamList,
  navigatorManager,
} from '@/navigation/navigatorManager'
import { useOverlay } from '@/store/useOverlay'
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
  const { setLoadingOverlay } = useOverlay()
  const [loading, setLoading] = React.useState(true)
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

  React.useEffect(() => {
    setLoadingOverlay(true, t('common.loading'))
    const timer = setTimeout(() => {
      setLoading(false)
      setLoadingOverlay(false)
    }, 700)
    return () => {
      clearTimeout(timer)
      setLoadingOverlay(false)
    }
  }, [setLoadingOverlay])

  if (loading) return <EmptyContainer />

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 8 }}>
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
