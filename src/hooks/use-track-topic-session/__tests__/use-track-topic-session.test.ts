import { renderHook } from '@testing-library/react-native'
import useTrackTopicSession from '../track-topic-session.hook'

const mockStartSession = jest.fn().mockResolvedValue('session-key-1')
const mockStopSessionByKey = jest.fn()

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (cb: () => () => void) => {
    const cleanup = cb()
    return cleanup
  },
}))

jest.mock('../../../services/usage/usage-tracker', () => ({
  startSession: (...args: any[]) => mockStartSession(...args),
  stopSessionByKey: (...args: any[]) => mockStopSessionByKey(...args),
}))

describe('useTrackTopicSession', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders without crashing when topicId is provided', () => {
    const { unmount } = renderHook(() =>
      useTrackTopicSession('topic-1', 'summary', 'summary-1'),
    )
    expect(() => unmount()).not.toThrow()
  })

  it('renders without crashing when all params are undefined', () => {
    const { unmount } = renderHook(() =>
      useTrackTopicSession(undefined, undefined, undefined),
    )
    expect(() => unmount()).not.toThrow()
  })

  it('calls startSession with correct args when topicId and scope are provided', async () => {
    renderHook(() => useTrackTopicSession('topic-abc', 'challenge', 'ch-1'))
    await Promise.resolve()
    expect(mockStartSession).toHaveBeenCalledWith(
      'topic-abc',
      'challenge',
      'ch-1',
    )
  })

  it('does not call startSession when topicId is undefined', async () => {
    renderHook(() => useTrackTopicSession(undefined, 'summary', 'sum-1'))
    await Promise.resolve()
    expect(mockStartSession).not.toHaveBeenCalled()
  })

  it('does not call startSession when scope is undefined', async () => {
    renderHook(() => useTrackTopicSession('topic-1', undefined, undefined))
    await Promise.resolve()
    expect(mockStartSession).not.toHaveBeenCalled()
  })

  it('passes the id param to startSession', async () => {
    renderHook(() => useTrackTopicSession('t-1', 'summary_list', 'list-99'))
    await Promise.resolve()
    expect(mockStartSession).toHaveBeenCalledWith(
      't-1',
      'summary_list',
      'list-99',
    )
  })
})
