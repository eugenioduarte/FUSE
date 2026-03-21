import React, { useEffect } from 'react'
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

// const { width, height } = Dimensions.get('window')

type Props = {
  visible: boolean
  onClose: () => void
  origin: { x: number; y: number } // posição do botão
}

export const HeaderDashboardMenuOverlay: React.FC<Props> = ({
  visible,
  onClose,
  origin,
}) => {
  const scale = useSharedValue(0)

  useEffect(() => {
    scale.value = withTiming(visible ? 1 : 0, {
      duration: 600,
      easing: Easing.out(Easing.exp),
    })
  }, [visible, scale])

  // backdrop opacity animation (0 -> 1)
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scale.value, [0, 1], [0, 1])
    return {
      opacity,
    }
  })

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalRoot} pointerEvents={visible ? 'auto' : 'none'}>
        {/* Full-screen backdrop that fades in/out */}
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, animatedStyle]}
        />

        {/* Pressable to allow closing when tapping outside the menu */}
        <Pressable style={styles.menuContainer} onPress={onClose}>
          <Pressable style={styles.menuInner} onPress={() => {}}>
            <Text style={styles.menuItem}>Perfil</Text>
            <Text style={styles.menuItem}>Configurações</Text>
            <Text style={styles.menuItem} onPress={onClose}>
              Fechar
            </Text>
          </Pressable>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flex: 1,
    zIndex: 9999,
    elevation: 9999,
  },
  circle: {
    position: 'absolute',
    zIndex: 1,
  },
  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1,
  },
  menuContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  menuInner: {
    // prevents the outer Pressable from closing when tapping inside this box
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  menuItem: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 10,
  },
})
