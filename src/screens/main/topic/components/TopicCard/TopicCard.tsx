import { ChevronIcon } from '@/assets/icons'
import { Text } from '@/components'
import { useTheme } from '@/hooks/useTheme'
import { navigatorManager } from '@/navigation'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'

type TopicCardProps = {
  item: {
    id: string
    title: string
    description?: string
  }
}

const TopicCard = ({ item }: TopicCardProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const handleNavigation = () => {
    navigatorManager.goToTopicDetails(item.id)
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={handleNavigation} style={styles.card}>
        <View style={styles.imageContainer}>
          <Image
            source={require('@/assets/images/mock/zumbi.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <Text
            variant="xxLarge"
            style={{ fontSize: 50, lineHeight: 60, textAlign: 'right' }}
          >
            {item.title.split(' ')[0]}
          </Text>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text variant="large">
              {item.title.split(' ').slice(1).join(' ')}
            </Text>
            <ChevronIcon
              onPress={handleNavigation}
              style={styles.chevron}
              color={'red'}
              stroke={'red'}
            />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default TopicCard

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    wrapper: {
      paddingTop: 30,
    },
    card: {
      borderRadius: theme.border.radius16,
      padding: theme.spacings.medium,
      borderColor: theme.colors.borderColor,
      borderWidth: theme.border.size,
      flexDirection: 'row',
      position: 'relative',
      borderBottomWidth: theme.border.shadow,
      borderRightWidth: theme.border.shadow,
      backgroundColor: theme.colors.backgroundPrimary,
      maxHeight: 100,
    },
    imageContainer: {
      justifyContent: 'center',
      position: 'absolute',
      bottom: 0,
      left: theme.spacings.small,
      zIndex: 1,
    },
    image: {
      width: 120,
      height: 120,
      transform: [{ scaleX: -1 }],
    },
    spacer: {
      width: 120,
    },
    content: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'flex-end',
      width: '100%',
    },
    chevron: {
      marginTop: theme.spacings.xSmall,
      marginLeft: theme.spacings.xSmall,
    },
  })
