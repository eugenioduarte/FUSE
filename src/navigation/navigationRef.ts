import { createNavigationContainerRef } from '@react-navigation/native'
import { RootStackParamList } from './navigatorManager'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()
