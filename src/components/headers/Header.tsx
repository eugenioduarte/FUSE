import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  Easing,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated'
import { ROUTES } from '../../constants/routes'
import { navigationRef } from '../../navigation/navigationRef'
import { summariesRepository } from '../../services/repositories/summaries.repository'
import { useOverlay } from '../../store/useOverlay'
import { useThemeStore } from '../../store/useThemeStore'
import HeaderAddTopic from './HeaderAddTopic'
import HeaderChallengeAdd from './HeaderChallengeAdd'
import HeaderDashboard from './HeaderDashboard'
import HeaderSummaryDetails from './HeaderSummaryDetails'
import HeaderTopicDetails from './HeaderTopicDetails'
import HeaderTopicList from './HeaderTopicList'

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
    if (currentType === ROUTES.DashboardScreen) return <HeaderDashboard />
    if (currentType === ROUTES.TopicAddScreen) return <HeaderAddTopic />
    if (currentType === ROUTES.TopicScreen) return <HeaderTopicList />
    if (currentType === ROUTES.TopicDetailsScreen) {
      return <HeaderTopicDetails />
    }
    if (currentType === ROUTES.SummaryDetailsScreen) {
      return <HeaderSummaryDetails />
    }
    if (currentType === ROUTES.ChallengeAddScreen) {
      return <HeaderChallengeAdd />
    }
    return <DefaultHeader title={title} />
  }

  return (
    <Animated.View
      key={currentType}
      entering={SlideInUp.duration(600)
        .easing(Easing.out(Easing.cubic))
        .damping(100)
        .withInitialValues({ opacity: 0 })}
      exiting={SlideOutDown.duration(450)
        .easing(Easing.in(Easing.cubic))
        .damping(100)
        .withInitialValues({ opacity: 1 })}
      style={styles.container}
    >
      {renderHeader()}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
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
