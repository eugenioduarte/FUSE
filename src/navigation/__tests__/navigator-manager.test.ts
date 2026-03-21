jest.mock('../navigationRef', () => ({
  navigationRef: {
    isReady: jest.fn().mockReturnValue(true),
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  },
}))

jest.mock('@react-navigation/native', () => ({
  DrawerActions: {
    openDrawer: jest.fn().mockReturnValue({ type: 'OPEN_DRAWER' }),
    closeDrawer: jest.fn().mockReturnValue({ type: 'CLOSE_DRAWER' }),
    toggleDrawer: jest.fn().mockReturnValue({ type: 'TOGGLE_DRAWER' }),
  },
}))

jest.mock('../../store/useOverlay', () => ({
  useOverlay: {
    getState: jest.fn().mockReturnValue({
      setRankingOverlay: jest.fn(),
    }),
  },
}))

import { navigatorManager } from '../navigatorManager'

const navigationRefMock = jest.requireMock('../navigationRef').navigationRef

describe('navigatorManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    navigationRefMock.isReady.mockReturnValue(true)
  })

  describe('drawer controls', () => {
    it('openMenu dispatches openDrawer action', () => {
      navigatorManager.openMenu()
      expect(navigationRefMock.dispatch).toHaveBeenCalled()
    })

    it('closeMenu dispatches closeDrawer action', () => {
      navigatorManager.closeMenu()
      expect(navigationRefMock.dispatch).toHaveBeenCalled()
    })

    it('toggleMenu dispatches toggleDrawer action', () => {
      navigatorManager.toggleMenu()
      expect(navigationRefMock.dispatch).toHaveBeenCalled()
    })

    it('does not dispatch when navigation is not ready', () => {
      navigationRefMock.isReady.mockReturnValue(false)
      navigatorManager.openMenu()
      expect(navigationRefMock.dispatch).not.toHaveBeenCalled()
    })
  })

  describe('screen navigation', () => {
    it('goToLoginScreen navigates to LoginScreen', () => {
      navigatorManager.goToLoginScreen()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('LoginScreen')
    })

    it('goToDashboard navigates to DashboardScreen', () => {
      navigatorManager.goToDashboard()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('DashboardScreen')
    })

    it('goToProfile navigates to ProfileScreen', () => {
      navigatorManager.goToProfile()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('ProfileScreen')
    })

    it('goToTopicDetails navigates with topicId param', () => {
      navigatorManager.goToTopicDetails('topic-abc')
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'TopicDetailsScreen',
        { topicId: 'topic-abc' },
      )
    })

    it('goToCalendarEdit navigates with id param', () => {
      navigatorManager.goToCalendarEdit({ id: 'cal-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'CalendarEditScreen',
        { id: 'cal-1' },
      )
    })

    it('goBack calls goBack on the ref', () => {
      navigatorManager.goBack()
      expect(navigationRefMock.goBack).toHaveBeenCalled()
    })

    it('does not navigate when navigation is not ready', () => {
      navigationRefMock.isReady.mockReturnValue(false)
      navigatorManager.goToDashboard()
      expect(navigationRefMock.navigate).not.toHaveBeenCalled()
    })
  })
})
