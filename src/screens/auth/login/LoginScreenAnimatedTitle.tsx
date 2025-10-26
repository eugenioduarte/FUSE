import { width } from '@/src/utils/dimensions'
import React from 'react'
import { Image, View } from 'react-native'

const LoginScreenAnimatedTitle = () => {
  return (
    <View
      style={{
        position: 'absolute',
        top: 50,
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Image
        source={require('@/src/assets/images/logo.png')}
        style={{
          width: width,
          height: width,
          alignSelf: 'center',
        }}
      />
    </View>
  )
}

export default LoginScreenAnimatedTitle
