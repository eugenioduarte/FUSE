jest.mock('../navigation-ref', () => ({
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

jest.mock('../../store/overlay.store', () => ({
  useOverlay: {
    getState: jest.fn().mockReturnValue({
      setRankingOverlay: jest.fn(),
    }),
  },
}))

import { navigatorManager } from '../navigator-manager'

const navigationRefMock = jest.requireMock('../navigation-ref').navigationRef

describe('navigatorManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    navigationRefMock.isReady.mockReturnValue(true)
  })

  // -----------------------------------------------------------------------
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

  // -----------------------------------------------------------------------
  describe('auth screens', () => {
    it('goToLoginScreen navigates to LoginScreen', () => {
      navigatorManager.goToLoginScreen()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('LoginScreen')
    })

    it('goToRegister navigates to RegisterScreen', () => {
      navigatorManager.goToRegister()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('RegisterScreen')
    })

    it('goToRecovery navigates to RecoveryScreen', () => {
      navigatorManager.goToRecovery()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('RecoveryScreen')
    })
  })

  // -----------------------------------------------------------------------
  describe('main screens', () => {
    it('goToDashboard navigates to DashboardScreen', () => {
      navigatorManager.goToDashboard()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('DashboardScreen')
    })

    it('goToTopic navigates to TopicScreen', () => {
      navigatorManager.goToTopic()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('TopicScreen')
    })
  })

  // -----------------------------------------------------------------------
  describe('calendar screens', () => {
    it('goToCalendar navigates to CalendarScreen', () => {
      navigatorManager.goToCalendar()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('CalendarScreen')
    })

    it('goToCalendarAdd navigates to CalendarAddScreen without params', () => {
      navigatorManager.goToCalendarAdd()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'CalendarAddScreen',
        undefined,
      )
    })

    it('goToCalendarAdd navigates with date param', () => {
      navigatorManager.goToCalendarAdd({ date: '2025-01-01' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'CalendarAddScreen',
        { date: '2025-01-01' },
      )
    })

    it('goToCalendarDetails navigates to CalendarDetailsScreen', () => {
      navigatorManager.goToCalendarDetails()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'CalendarDetailsScreen',
      )
    })

    it('goToCalendarEdit navigates with id param', () => {
      navigatorManager.goToCalendarEdit({ id: 'cal-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'CalendarEditScreen',
        { id: 'cal-1' },
      )
    })
  })

  // -----------------------------------------------------------------------
  describe('challenge screens', () => {
    it('goToChallengeAdd navigates to ChallengeAddScreen without params', () => {
      navigatorManager.goToChallengeAdd()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeAddScreen',
        undefined,
      )
    })

    it('goToChallengeAdd navigates with summaryId param', () => {
      navigatorManager.goToChallengeAdd({ summaryId: 'sum-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeAddScreen',
        { summaryId: 'sum-1' },
      )
    })

    it('goToChallengesList navigates to ChallengesListScreen', () => {
      navigatorManager.goToChallengesList({ summaryId: 'sum-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengesListScreen',
        expect.anything(),
      )
    })

    it('goToChallengeRunQuiz navigates with challengeId', () => {
      navigatorManager.goToChallengeRunQuiz({ challengeId: 'ch-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeRunQuizScreen',
        expect.objectContaining({ challengeId: 'ch-1' }),
      )
    })

    it('goToChallengeRunHangman navigates with challengeId', () => {
      navigatorManager.goToChallengeRunHangman({ challengeId: 'ch-2' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeRunHangmanScreen',
        expect.objectContaining({ challengeId: 'ch-2' }),
      )
    })

    it('goToChallengeRunMatrix navigates with challengeId', () => {
      navigatorManager.goToChallengeRunMatrix({ challengeId: 'ch-3' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeRunMatrixScreen',
        expect.objectContaining({ challengeId: 'ch-3' }),
      )
    })

    it('goToChallengeRunTextAnswer navigates with challengeId', () => {
      navigatorManager.goToChallengeRunTextAnswer({ challengeId: 'ch-4' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeRunTextAnswerScreen',
        expect.objectContaining({ challengeId: 'ch-4' }),
      )
    })

    it('goToChallengeFinishedScore navigates with score and total', () => {
      navigatorManager.goToChallengeFinishedScore({
        score: 7,
        total: 10,
        summaryId: 'sum-1',
      })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeFinishedScoreScreen',
        expect.objectContaining({ score: 7, total: 10 }),
      )
    })

    it('goToChallengeReviewQuiz navigates with challengeId', () => {
      navigatorManager.goToChallengeReviewQuiz({ challengeId: 'ch-1' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeReviewQuizScreen',
        expect.objectContaining({ challengeId: 'ch-1' }),
      )
    })

    it('goToChallengeReviewHangman navigates with challengeId', () => {
      navigatorManager.goToChallengeReviewHangman({ challengeId: 'ch-2' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeReviewHangmanScreen',
        expect.objectContaining({ challengeId: 'ch-2' }),
      )
    })

    it('goToChallengeReviewMatrix navigates with challengeId', () => {
      navigatorManager.goToChallengeReviewMatrix({ challengeId: 'ch-3' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeReviewMatrixScreen',
        expect.objectContaining({ challengeId: 'ch-3' }),
      )
    })

    it('goToChallengeReviewTextAnswer navigates with challengeId', () => {
      navigatorManager.goToChallengeReviewTextAnswer({ challengeId: 'ch-4' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ChallengeReviewTextAnswerScreen',
        expect.objectContaining({ challengeId: 'ch-4' }),
      )
    })
  })

  // -----------------------------------------------------------------------
  describe('topic & summary screens', () => {
    it('goToTopicDetails navigates with topicId param', () => {
      navigatorManager.goToTopicDetails('topic-abc')
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'TopicDetailsScreen',
        { topicId: 'topic-abc' },
      )
    })

    it('goToSummaryDetails navigates with summaryId', () => {
      navigatorManager.goToSummaryDetails('sum-1')
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'SummaryDetailsScreen',
        expect.objectContaining({ summaryId: 'sum-1' }),
      )
    })

    it('goToTopicAdd navigates to TopicAddScreen', () => {
      navigatorManager.goToTopicAdd()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('TopicAddScreen')
    })

    it('goToSummary navigates without params', () => {
      navigatorManager.goToSummary()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'SummaryScreen',
        undefined,
      )
    })

    it('goToSummary navigates with params', () => {
      navigatorManager.goToSummary({ topicId: 't-1', seedPrompt: 'seed' })
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('SummaryScreen', {
        topicId: 't-1',
        seedPrompt: 'seed',
      })
    })

    it('goToTopicChat navigates with topicId', () => {
      navigatorManager.goToTopicChat('topic-xyz')
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'TopicChatScreen',
        expect.objectContaining({ topicId: 'topic-xyz' }),
      )
    })
  })

  // -----------------------------------------------------------------------
  describe('menu screens', () => {
    it('goToProfile navigates to ProfileScreen', () => {
      navigatorManager.goToProfile()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('ProfileScreen')
    })

    it('goToConnections navigates to ConnectionsScreen', () => {
      navigatorManager.goToConnections()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'ConnectionsScreen',
      )
    })

    it('goToPayment navigates to PaymentScreen', () => {
      navigatorManager.goToPayment()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith('PaymentScreen')
    })

    it('goToNotifications navigates to NotificationsScreen', () => {
      navigatorManager.goToNotifications()
      expect(navigationRefMock.navigate).toHaveBeenCalledWith(
        'NotificationsScreen',
      )
    })
  })

  // -----------------------------------------------------------------------
  describe('goBack', () => {
    it('calls goBack on the ref when ready', () => {
      navigatorManager.goBack()
      expect(navigationRefMock.goBack).toHaveBeenCalled()
    })

    it('does not call goBack when navigation is not ready', () => {
      navigationRefMock.isReady.mockReturnValue(false)
      navigatorManager.goBack()
      expect(navigationRefMock.goBack).not.toHaveBeenCalled()
    })
  })

  // -----------------------------------------------------------------------
  describe('guard: does not navigate when not ready', () => {
    beforeEach(() => navigationRefMock.isReady.mockReturnValue(false))

    it.each([
      ['goToLoginScreen', () => navigatorManager.goToLoginScreen()],
      ['goToDashboard', () => navigatorManager.goToDashboard()],
      ['goToRegister', () => navigatorManager.goToRegister()],
      ['goToRecovery', () => navigatorManager.goToRecovery()],
      ['goToTopic', () => navigatorManager.goToTopic()],
      ['goToCalendar', () => navigatorManager.goToCalendar()],
      ['goToProfile', () => navigatorManager.goToProfile()],
      ['goToTopicAdd', () => navigatorManager.goToTopicAdd()],
    ])('%s does not navigate when not ready', (_name, fn) => {
      fn()
      expect(navigationRefMock.navigate).not.toHaveBeenCalled()
    })
  })
})
