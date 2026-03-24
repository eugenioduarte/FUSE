import {
  listenTopicChat,
  sendTopicChatMessage,
} from '@/services/firebase/chat.service'
import { act, renderHook } from '@testing-library/react-native'
import { useTopicChat } from '../topic-chat.hook'

// --- Mocks ---

const mockTopicId = 'topic-abc'
const mockRoute = { params: { topicId: mockTopicId } }

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(() => mockRoute),
}))

const mockUser = { id: 'uid-1', name: 'Alice' }
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: mockUser })),
}))

let chatCallback: ((msgs: any[]) => void) | null = null
const mockListenUnsub = jest.fn()
jest.mock('@/services/firebase/chat.service', () => ({
  listenTopicChat: jest.fn((topicId: string, cb: (msgs: any[]) => void) => {
    chatCallback = cb
    return mockListenUnsub
  }),
  sendTopicChatMessage: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/services/firebase/auth.service', () => ({
  getFirebaseAuth: jest.fn(() => ({ currentUser: { uid: 'uid-1' } })),
}))

const mockGetDoc = jest.fn()
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({}) as any),
  doc: jest.fn(),
  getDoc: (...args: any[]) => mockGetDoc(...args),
}))

jest.mock('@/services/firebase/firebase-init', () => ({
  getFirebaseApp: jest.fn(() => ({}) as any),
}))

jest.mock('@/locales/translation', () => ({
  t: (key: string) => key,
}))

describe('useTopicChat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    chatCallback = null
  })

  it('returns the topicId from route params', () => {
    const { result } = renderHook(() => useTopicChat())
    expect(result.current.topicId).toBe(mockTopicId)
  })

  it('starts with empty messages and empty input', () => {
    const { result } = renderHook(() => useTopicChat())
    expect(result.current.messages).toEqual([])
    expect(result.current.input).toBe('')
  })

  it('calls listenTopicChat with the topicId', () => {
    renderHook(() => useTopicChat())
    expect(listenTopicChat).toHaveBeenCalledWith(
      mockTopicId,
      expect.any(Function),
    )
  })

  it('updates messages when listener fires', () => {
    const { result } = renderHook(() => useTopicChat())
    const msgs = [{ id: 'm1', authorId: 'uid-1', text: 'Hello', createdAt: 1 }]
    act(() => {
      chatCallback?.(msgs)
    })
    expect(result.current.messages).toEqual(msgs)
  })

  it('sets myUid from auth store', () => {
    const { result } = renderHook(() => useTopicChat())
    expect(result.current.myUid).toBe('uid-1')
  })

  it('initialises nameByUid with own name', () => {
    const { result } = renderHook(() => useTopicChat())
    expect(result.current.nameByUid['uid-1']).toBe('Alice')
  })

  it('unsubscribes listener on unmount', () => {
    const { unmount } = renderHook(() => useTopicChat())
    unmount()
    expect(mockListenUnsub).toHaveBeenCalled()
  })

  it('setInput updates input value', () => {
    const { result } = renderHook(() => useTopicChat())
    act(() => result.current.setInput('hello'))
    expect(result.current.input).toBe('hello')
  })

  it('onSend calls sendTopicChatMessage and clears input', async () => {
    const { result } = renderHook(() => useTopicChat())
    act(() => result.current.setInput('A message'))
    await act(() => result.current.onSend())
    expect(sendTopicChatMessage).toHaveBeenCalledWith(mockTopicId, 'A message')
    expect(result.current.input).toBe('')
  })

  it('onSend does nothing when input is empty', async () => {
    const { result } = renderHook(() => useTopicChat())
    await act(() => result.current.onSend())
    expect(sendTopicChatMessage).not.toHaveBeenCalled()
  })

  it('onSend does nothing when input is only whitespace', async () => {
    const { result } = renderHook(() => useTopicChat())
    act(() => result.current.setInput('   '))
    await act(() => result.current.onSend())
    expect(sendTopicChatMessage).not.toHaveBeenCalled()
  })

  it('loads names for other authors when new messages arrive', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ name: 'Bob' }),
    })
    const { result } = renderHook(() => useTopicChat())
    const msgs = [{ id: 'm1', authorId: 'uid-other', text: 'Hi', createdAt: 1 }]
    await act(async () => {
      chatCallback?.(msgs)
      await Promise.resolve()
      await Promise.resolve()
    })
    expect(result.current.nameByUid['uid-other']).toBe('Bob')
  })

  it('provides an object ref for the list', () => {
    const { result } = renderHook(() => useTopicChat())
    expect(result.current.listRef).toBeDefined()
  })
})
