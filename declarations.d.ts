// declarations.d.ts
declare module '*.svg' {
  import React from 'react'
  import { SvgProps } from 'react-native-svg'
  const content: React.FC<SvgProps>
  export default content
}

// Fallback module declaration to unblock types when the TS server hasn't loaded expo-notifications types yet
declare module 'expo-notifications'
