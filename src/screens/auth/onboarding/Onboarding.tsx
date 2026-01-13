import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { navigatorManager } from '@/navigation/navigatorManager'
import { useAuthStore } from '@/store/useAuthStore'
import { ThemeType } from '@/types/theme.type'
import { Ionicons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import {
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const screens = [
  {
    key: 'one',
    title: 'Crie tópicos',
    subtitle: 'Organize seus estudos por tópico',
  },
  {
    key: 'two',
    title: 'Participe de desafios',
    subtitle: 'Treine com exercícios e provas',
  },
  {
    key: 'three',
    title: 'Estude em grupo',
    subtitle: 'Crie ou participe de grupos de estudo',
  },
]

const Item = ({
  item,
  index,
}: {
  item: (typeof screens)[number]
  index: number
}) => {
  const images = [
    require('@/assets/images/onboarding/albert.png'),
    require('@/assets/images/onboarding/zumbi.png'),
    require('@/assets/images/onboarding/ipiranga.png'),
  ]

  const imageSource = images[index] ?? images[0]
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <View style={styles.page}>
      <Image
        source={imageSource}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <View style={styles.textWrapper} pointerEvents="box-none">
        <Text style={styles.title} variant="xxxLarge">
          {item.title}
        </Text>
        <Text style={styles.subtitle} variant="xLarge">
          {item.subtitle}
        </Text>
      </View>
    </View>
  )
}

const Onboarding = () => {
  const listRef = useRef<FlatList>(null)
  const [index, setIndex] = useState(0)
  const setHasShownOnboarding = useAuthStore((s) => s.setHasShownOnboarding)
  const theme = useTheme()
  const styles = createStyles(theme)

  const handleNext = () => {
    if (index < screens.length - 1) {
      const next = index + 1
      listRef.current?.scrollToIndex({ index: next })
      setIndex(next)
      return
    }

    setHasShownOnboarding(false) // MOCK
    navigatorManager.goToLoginScreen()
  }

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
      />
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Ionicons name="chevron-back" size={24} color="white" />
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
      marginRight: 16,
    },
    page: {
      height: SCREEN_HEIGHT,
      width: SCREEN_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
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
      marginBottom: 8,
      textAlign: 'right',
      backgroundColor: theme.colors.accentYellow,
      padding: theme.spacings.large,
      borderRadius: theme.border.radius16,
      maxWidth: SCREEN_WIDTH - 60,
    },
    subtitle: {
      textAlign: 'right',
      backgroundColor: theme.colors.accentYellow,
      padding: theme.spacings.medium,
      borderRadius: theme.border.radius16,
    },
    buttonWrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 32,
    },
    chevron: {
      position: 'absolute',
      width: 48,
      height: 48,
      zIndex: 10,
      bottom: 100,
      right: 16,
    },
    nextButton: {
      backgroundColor: theme.colors.accentYellow,
      position: 'absolute',
      bottom: 16,
      right: 16,
      padding: 10,
      borderRadius: 30,
      transform: [{ rotate: '180deg' }],
    },
  })
