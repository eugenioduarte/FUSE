import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  LinearTransition,
  SlideInDown,
  SlideOutUp,
} from 'react-native-reanimated'
import { ROUTES } from '../../constants/routes'
import { navigationRef } from '../../navigation/navigationRef'
import { useOverlay } from '../../store/useOverlay'
import { useThemeStore } from '../../store/useThemeStore'
import HeaderDashboard from './HeaderDashboard'

const DefaultHeader = ({ title }: { title: string }) => {
  const isReady = navigationRef.isReady()
  const canGoBack = isReady && navigationRef.canGoBack()
  const currentRoute = isReady ? navigationRef.getCurrentRoute() : undefined
  const isChallengesList = currentRoute?.name === ROUTES.ChallengesListScreen
  const summaryId = (currentRoute?.params as any)?.summaryId as
    | string
    | undefined
  const shouldForceBackToSummary = isChallengesList && !!summaryId
  const { setFastWayOverlay } = useOverlay()

  return (
    <>
      {canGoBack || shouldForceBackToSummary ? (
        <TouchableOpacity
          onPress={() => {
            if (shouldForceBackToSummary) {
              navigationRef.navigate(ROUTES.SummaryDetailsScreen, { summaryId })
            } else if (canGoBack) {
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
      entering={SlideInDown.springify()
        .damping(25)
        .withInitialValues({ opacity: 0 })}
      exiting={SlideOutUp.duration(700).withInitialValues({ opacity: 1 })}
      layout={LinearTransition.springify().damping(25).stiffness(150)}
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
