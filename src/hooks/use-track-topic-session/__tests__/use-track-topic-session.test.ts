import { renderHook } from '@testing-library/react-native'
import useTrackTopicSession from '../use-track-topic-session'

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => void) => cb(),
}))

jest.mock('../../../services/usage/usageTracker', () => ({
  startSession: jest.fn().mockResolvedValue('session-key-1'),
  stopSessionByKey: jest.fn(),
}))

describe('useTrackTopicSession', () => {
  it('should render without crashing when topicId is provided', () => {
    const { unmount } = renderHook(() =>
      useTrackTopicSession('topic-1', 'summary', 'summary-1'),
    )
    expect(() => unmount()).not.toThrow()
  })

  it('should render without crashing when topicId is undefined', () => {
    const { unmount } = renderHook(() =>
      useTrackTopicSession(undefined, undefined, undefined),
    )
    expect(() => unmount()).not.toThrow()
  })
})
