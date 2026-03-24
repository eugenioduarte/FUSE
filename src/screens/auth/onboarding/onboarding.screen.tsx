import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'

import { Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useAuthStore } from '@/store/auth.store'
import { ThemeType } from '@/types/theme.type'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const screens = [
  {
    key: 'one',
    titleKey: 'onboarding.title.one',
    subtitleKey: 'onboarding.subtitle.one',
  },
  {
    key: 'two',
    titleKey: 'onboarding.title.two',
    subtitleKey: 'onboarding.subtitle.two',
  },
  {
    key: 'three',
    titleKey: 'onboarding.title.three',
    subtitleKey: 'onboarding.subtitle.three',
  },
]

const IMAGES = [
  require('@/assets/images/onboarding/albert.png'),
  require('@/assets/images/onboarding/zumbi.png'),
  require('@/assets/images/onboarding/ipiranga.png'),
]

type ScreenItem = (typeof screens)[number]

const Item = ({ item, index }: { item: ScreenItem; index: number }) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const imageSource = IMAGES[index] ?? IMAGES[0]
  const imageStyle = useMemo(() => createImageStyle(index), [index])

  return (
    <View style={styles.page}>
      <Image
        source={imageSource}
        style={[styles.backgroundImage, imageStyle]}
        resizeMode={index === 1 ? 'cover' : 'contain'}
      />

      <View style={styles.textWrapper} pointerEvents="box-none">
        <Text style={styles.title} variant="xxxLarge">
          {t(item.titleKey)}
        </Text>
        <Text style={styles.subtitle} variant="xLarge">
          {t(item.subtitleKey)}
        </Text>
      </View>
    </View>
  )
}

const createImageStyle = (index: number) => {
  const w = SCREEN_WIDTH
  const baseHeight = w * 2.5

  if (index === 1) {
    return {
      width: w * 1.5,
      height: baseHeight,
      marginLeft: -w * 0.2,
    }
  }

  if (index === 2) {
    return {
      width: w * 1.5,
      height: baseHeight,
      marginLeft: -w * 0.2,
    }
  }

  return {
    width: w * 1.2,
    height: baseHeight,
    marginLeft: -w * 0.1,
  }
}

const Onboarding: React.FC = () => {
  const listRef = useRef<FlatList>(null)
  const [index, setIndex] = useState(0)
  const setHasShownOnboarding = useAuthStore((s) => s.setHasShownOnboarding)
  const theme = useTheme()
  const styles = createStyles(theme)

  const handleNext = useCallback(() => {
    if (index < screens.length - 1) {
      const next = index + 1
      listRef.current?.scrollToIndex({ index: next })
      setIndex(next)
      return
    }

    // Mark onboarding as shown so it won't reappear on next app start
    setHasShownOnboarding(true)
    navigatorManager.goToLoginScreen()
  }, [index, setHasShownOnboarding])

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <FlatList
        style={styles.list}
        ref={listRef}
        data={screens}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(i) => i.key}
        renderItem={({ item, index }) => <Item item={item} index={index} />}
        onMomentumScrollEnd={(ev) => {
          const newIndex = Math.round(
            ev.nativeEvent.contentOffset.x / SCREEN_WIDTH,
          )
          setIndex(newIndex)
        }}
        bounces={false}
        overScrollMode="never"
      />

      <TouchableOpacity
        accessibilityLabel={t('onboarding.next')}
        style={styles.nextButton}
        onPress={handleNext}
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </View>
  )
}

export default Onboarding

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    list: {
      flex: 1,
    },
    textWrapper: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginRight: theme.spacings.large,
    },
    page: {
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      overflow: 'hidden',
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    title: {
      marginBottom: theme.spacings.medium,
      textAlign: 'right',
      backgroundColor: theme.colors.accentYellow,
      padding: theme.spacings.large,
      borderRadius: theme.border.radius16,
      maxWidth: SCREEN_WIDTH - theme.spacings.xLarge,
      borderWidth: 3,
      borderColor: theme.colors.white,
    },
    subtitle: {
      textAlign: 'right',
      backgroundColor: theme.colors.accentYellow,
      padding: theme.spacings.medium,
      borderRadius: theme.border.radius16,
      borderWidth: 3,
      borderColor: theme.colors.white,
    },
    buttonWrapper: {
      position: 'absolute',
      left: theme.spacings.medium,
      right: theme.spacings.medium,
      bottom: theme.spacings.xLarge,
    },
    chevron: {
      position: 'absolute',
      width: 48,
      height: 48,
      zIndex: 10,
      bottom: 100,
      right: theme.spacings.medium,
    },
    nextButton: {
      backgroundColor: theme.colors.accentYellow,
      position: 'absolute',
      bottom: theme.spacings.medium,
      right: theme.spacings.medium,
      padding: theme.spacings.xMedium,
      borderRadius: 30,
      transform: [{ rotate: '180deg' }],
      borderWidth: 3,
      borderColor: theme.colors.white,
    },
  })
