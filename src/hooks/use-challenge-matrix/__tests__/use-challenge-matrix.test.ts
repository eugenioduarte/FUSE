import { renderHook, waitFor } from '@testing-library/react-native'
import useChallengeMatrix, { generateMatrixQA } from '../challenge-matrix.hook'

// --- Mocks ---
const mockSetLoadingOverlay = jest.fn()
const mockSetErrorOverlay = jest.fn()

jest.mock('@/hooks/use-track-topic-session', () => ({
  __esModule: true,
  default: jest.fn(),
}))
jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: {
    list: jest.fn().mockResolvedValue([]),
    upsert: jest.fn().mockResolvedValue(undefined),
  },
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { getById: jest.fn().mockResolvedValue(null) },
}))
jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'me-1' } })),
}))
jest.mock('@/store/overlay.store', () => ({
  useOverlay: jest.fn(() => ({
    setLoadingOverlay: mockSetLoadingOverlay,
    setErrorOverlay: mockSetErrorOverlay,
  })),
}))
jest.mock('@/services/prompts', () => ({
  MATRIX_SYSTEM: 'SYS',
  matrixUserPrompt: jest.fn(() => 'user-prompt'),
}))
jest.mock('@/services/ai/ai.service', () => ({
  callAI: jest.fn(),
  toJSONSafe: jest.fn((v) => {
    try {
      return typeof v === 'string' ? JSON.parse(v) : v
    } catch {
      return null
    }
  }),
}))
jest.mock('@/services/firebase/immediate-flush', () => ({
  immediateCollaborativeFlush: jest.fn().mockResolvedValue(undefined),
}))

import { callAI } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'

const CHALLENGE_ID = 'ch-matrix-1'
const MOCK_CHALLENGE = {
  id: CHALLENGE_ID,
  summaryId: 'sum-1',
  payload: {
    question: 'Find the words',
    words: ['REACT', 'NATIVE', 'HOOKS', 'STATE', 'REDUX'],
  },
}
const MOCK_SUMMARY = { topicId: 'topic-1', content: 'Summary content.' }

describe('useChallengeMatrix', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(challengesRepository.list as jest.Mock).mockResolvedValue([
      MOCK_CHALLENGE,
    ])
    ;(summariesRepository.getById as jest.Mock).mockResolvedValue(MOCK_SUMMARY)
  })

  it('is a function', () => {
    expect(typeof useChallengeMatrix).toBe('function')
  })

  it('starts with loading=true', () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    expect(result.current.loading).toBe(true)
  })

  it('loads challenge and pre-generated words from payload', async () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.challenge?.id).toBe(CHALLENGE_ID)
    expect(result.current.words).toEqual([
      'REACT',
      'NATIVE',
      'HOOKS',
      'STATE',
      'REDUX',
    ])
    expect(result.current.question).toBe('Find the words')
  })

  it('initialises found as empty', async () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.found).toEqual([])
  })

  it('finished is null initially', async () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.finished).toBeNull()
  })

  it('exposes panHandlers', async () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.panHandlers).toBeDefined()
  })

  it('shows error overlay when challenge is not found', async () => {
    ;(challengesRepository.list as jest.Mock).mockResolvedValue([])
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockSetErrorOverlay).toHaveBeenCalled()
  })

  it('shows error overlay when summary is not found', async () => {
    ;(summariesRepository.getById as jest.Mock).mockResolvedValue(null)
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockSetErrorOverlay).toHaveBeenCalled()
  })

  it('total is 5', async () => {
    const { result } = renderHook(() => useChallengeMatrix(CHALLENGE_ID, false))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.total).toBe(5)
  })
})

describe('generateMatrixQA', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns question and 5 words from AI response', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({
        question: 'Find programming words',
        words: ['REACT', 'NATIVE', 'HOOKS', 'STATE', 'REDUX'],
      }),
    )
    const result = await generateMatrixQA('some summary')
    expect(result.question).toBe('Find programming words')
    expect(result.words).toHaveLength(5)
  })

  it('throws when AI returns fewer than 5 valid words', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({ question: 'Q?', words: ['A', 'B'] }),
    )
    await expect(generateMatrixQA('summary')).rejects.toThrow()
  })

  it('throws when AI response has no question', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({
        question: '',
        words: ['REACT', 'NATIVE', 'HOOKS', 'STATE', 'REDUX'],
      }),
    )
    await expect(generateMatrixQA('summary')).rejects.toThrow()
  })

  it('filters out words shorter than 3 chars', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({
        question: 'Q?',
        words: ['AB', 'REACT', 'NATIVE', 'HOOKS', 'STATE', 'REDUX'],
      }),
    )
    const result = await generateMatrixQA('summary')
    expect(result.words.every((w: string) => w.length >= 3)).toBe(true)
  })
})
