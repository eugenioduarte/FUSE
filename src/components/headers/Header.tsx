import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  LinearTransition,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated'
import { ROUTES } from '../../constants/routes'
import { navigationRef } from '../../navigation/navigationRef'
import { summariesRepository } from '../../services/repositories/summaries.repository'
import { useOverlay } from '../../store/useOverlay'
import { useThemeStore } from '../../store/useThemeStore'
import HeaderDashboard from './HeaderDashboard'

const DefaultHeader = ({ title }: { title: string }) => {
  const isReady = navigationRef.isReady()
  const canGoBack = isReady && navigationRef.canGoBack()
  const currentRoute = isReady ? navigationRef.getCurrentRoute() : undefined
  const isChallengesList = currentRoute?.name === ROUTES.ChallengesListScreen
  const isSummaryDetails = currentRoute?.name === ROUTES.SummaryDetailsScreen
  const isTopicDetails = currentRoute?.name === ROUTES.TopicDetailsScreen
  const summaryId = (currentRoute?.params as any)?.summaryId as
    | string
    | undefined
  const shouldForceBackToSummary = isChallengesList && !!summaryId
  const { setFastWayOverlay } = useOverlay()

  return (
    <>
      {canGoBack ||
      shouldForceBackToSummary ||
      isSummaryDetails ||
      isTopicDetails ? (
        <TouchableOpacity
          onPress={async () => {
            if (shouldForceBackToSummary) {
              navigationRef.navigate(ROUTES.SummaryDetailsScreen, { summaryId })
              return
            }
            if (isSummaryDetails) {
              const params = (currentRoute?.params as any) || {}
              const s = params.summary || null
              let topicId: string | undefined = s?.topicId
              if (!topicId && params.summaryId) {
                const fetched = await summariesRepository.getById(
                  params.summaryId,
                )
                topicId = fetched?.topicId
              }
              if (topicId) {
                navigationRef.navigate(ROUTES.TopicDetailsScreen, { topicId })
                return
              }
              if (canGoBack) {
                navigationRef.goBack()
                return
              }
            }
            if (isTopicDetails) {
              navigationRef.navigate(ROUTES.DashboardScreen)
              return
            }
            if (canGoBack) {
              navigationRef.goBack()
            }
          }}
          style={styles.iconWrapper}
        >
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      <TouchableOpacity
        onPress={() => setFastWayOverlay(true)}
        style={[styles.iconWrapper, { alignItems: 'flex-end' }]}
      >
        <Ionicons name="flash" size={20} color="#60a5fa" />
      </TouchableOpacity>
    </>
  )
}

export const Header: React.FC = () => {
  const { headerConfig } = useThemeStore()
  const { title, visible, type } = headerConfig
  const [currentType, setCurrentType] = useState(type)

  useEffect(() => {
    if (visible) {
      setCurrentType(type)
    }
  }, [type, visible])

  if (!visible) return null

  const renderHeader = () => {
    if (currentType === 'DashboardScreen') return <HeaderDashboard />
    return <DefaultHeader title={title} />
  }

  return (
    <Animated.View
      key={currentType}
      entering={SlideInUp.duration(700)
        .easing(Easing.out(Easing.cubic))
        .withInitialValues({ opacity: 0 })}
      exiting={SlideOutDown.duration(500)
        .easing(Easing.in(Easing.cubic))
        .withInitialValues({ opacity: 1 })}
      layout={LinearTransition.duration(220).easing(Easing.inOut(Easing.cubic))}
      style={styles.container}
    >
      {renderHeader()}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    backgroundColor: 'black',
  },
  iconWrapper: { width: 40, alignItems: 'flex-start' },
  iconPlaceholder: { width: 40 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})
