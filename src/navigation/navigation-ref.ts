import { createNavigationContainerRef } from '@react-navigation/native'
import { RootStackParamList } from './navigator-manager'

export const navigationRef = createNavigationContainerRef<RootStackParamList>()
