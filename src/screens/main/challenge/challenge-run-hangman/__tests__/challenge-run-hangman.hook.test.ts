import { act, renderHook, waitFor } from '@testing-library/react-native'
import useChallengeRunHangman, {
  generateHangmanRounds,
  HangmanGen,
} from '../challenge-run-hangman.hook'

// ---

import { callAI } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'

// --- fixtures ---
const CHALLENGE_ID = 'ch-hm-1'

const ROUNDS: HangmanGen[] = [
  { question: 'A programming concept', answer: 'HOOKS' },
  { question: 'A data type', answer: 'STRING' },
]

const MOCK_CHALLENGE = {
  id: CHALLENGE_ID,
  summaryId: 'sum-1',
  payload: {
    rounds: ROUNDS,
    totalRounds: 2,
  },
}

const MOCK_SUMMARY = { topicId: 'topic-1', content: 'Summary text.' }
const MOCK_TOPIC = { backgroundColor: '#00ff00' }

// --- Mocks ---
const mockSetLoadingOverlay = jest.fn()
const mockSetErrorOverlay = jest.fn()
jest.mock('@/store/overlay.store', () => ({
  useOverlay: jest.fn(() => ({
    setLoadingOverlay: mockSetLoadingOverlay,
    setErrorOverlay: mockSetErrorOverlay,
  })),
}))

jest.mock('@/store/auth.store', () => ({
  useAuthStore: jest.fn((selector) => selector({ user: { id: 'me-1' } })),
}))

jest.mock('@/store/theme.store', () => ({
  useThemeStore: jest.fn((selector) =>
    selector({
      colorLevelUp: { background_color: '#aabbcc' },
      setBackgroundColor: jest.fn(),
    }),
  ),
}))

jest.mock('@/services/repositories/challenges.repository', () => ({
  challengesRepository: {
    list: jest.fn(),
    upsert: jest.fn().mockResolvedValue(undefined),
  },
}))

jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: {
    getById: jest.fn(),
  },
}))

jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: {
    getById: jest.fn(),
  },
}))

jest.mock('@/hooks/use-track-topic-session', () => jest.fn())

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

jest.mock('@/services/prompts', () => ({
  buildHangmanPrompt: jest.fn(() => 'hangman-prompt'),
  HANGMAN_SYSTEM: 'HANGMAN_SYSTEM_PROMPT',
  buildQuizPrompt: jest.fn(),
  QUIZ_SYSTEM: '',
  TEXT_EXERCISES_SYSTEM: '',
  buildTextExercisesPrompt: jest.fn(),
  TEXT_EVALUATION_PROMPT: '',
}))

function setupMocks() {
  ;(challengesRepository.list as jest.Mock).mockResolvedValue([MOCK_CHALLENGE])
  ;(summariesRepository.getById as jest.Mock).mockResolvedValue(MOCK_SUMMARY)
  ;(topicsRepository.getById as jest.Mock).mockResolvedValue(MOCK_TOPIC)
}

describe('useChallengeRunHangman', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('starts with loading=true and no finished state', () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    expect(result.current.loading).toBe(true)
    expect(result.current.finished).toBeNull()
  })

  it('loads challenge and rounds from payload', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.challenge?.id).toBe(CHALLENGE_ID)
    expect(result.current.rounds).toHaveLength(2)
  })

  it('sets topicColor from topic repository', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.topicColor).toBe('#00ff00')
  })

  it('starts at step 0 with no guesses', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.step).toBe(0)
    expect(result.current.letters.size).toBe(0)
    expect(result.current.wrongs).toBe(0)
  })

  it('maxWrongs is 3', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.maxWrongs).toBe(3)
  })

  it('revealed shows blanks for unguessed letters', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // first round word is HOOKS (from fixture)
    expect(result.current.revealed).not.toContain('H')
    expect(result.current.revealed.split(' ').every((c) => c === '_')).toBe(
      true,
    )
  })

  it('onGuess adds letter and updates revealed', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onGuess('H'))
    expect(result.current.letters.has('H')).toBe(true)
    expect(result.current.revealed).toContain('H')
  })

  it('onGuess increments wrongs for incorrect letter', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onGuess('Z'))
    expect(result.current.wrongs).toBe(1)
  })

  it('isSolved becomes true when all letters are guessed', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    for (const letter of 'HOOKS') {
      act(() => result.current.onGuess(letter))
    }
    expect(result.current.isSolved).toBe(true)
    expect(result.current.canContinue).toBe(true)
  })

  it('isFailed becomes true at maxWrongs', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onGuess('Z'))
    act(() => result.current.onGuess('X'))
    act(() => result.current.onGuess('Q'))
    expect(result.current.isFailed).toBe(true)
    expect(result.current.canContinue).toBe(true)
  })

  it('onGuess is ignored when canContinue is true', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // fail
    for (const l of ['Z', 'X', 'Q']) act(() => result.current.onGuess(l))
    const prevWrongs = result.current.wrongs
    act(() => result.current.onGuess('A'))
    expect(result.current.wrongs).toBe(prevWrongs)
  })

  it('isLast is true on the final round', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // solve round 0
    for (const l of 'HOOKS') act(() => result.current.onGuess(l))
    await act(() => result.current.onContinue())
    expect(result.current.isLast).toBe(true)
  })

  it('onContinue after solve advances step', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    for (const l of 'HOOKS') act(() => result.current.onGuess(l))
    await act(() => result.current.onContinue())
    expect(result.current.step).toBe(1)
  })

  it('onContinue at last round sets finished', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // round 0: solve
    for (const l of 'HOOKS') act(() => result.current.onGuess(l))
    await act(() => result.current.onContinue())
    // round 1: solve
    for (const l of 'STRING') act(() => result.current.onGuess(l))
    await act(() => result.current.onContinue())
    expect(result.current.finished).toEqual({ score: 2, total: 2 })
    expect(challengesRepository.upsert).toHaveBeenCalled()
  })

  it('forceFinish sets finished regardless of progress', async () => {
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.forceFinish())
    expect(result.current.finished).not.toBeNull()
    expect(challengesRepository.upsert).toHaveBeenCalled()
  })

  it('shows error overlay when challenge not found', async () => {
    ;(challengesRepository.list as jest.Mock).mockResolvedValue([])
    const { result } = renderHook(() => useChallengeRunHangman(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockSetErrorOverlay).toHaveBeenCalled()
  })
})

describe('generateHangmanRounds', () => {
  beforeEach(() => jest.clearAllMocks())

  it('parses valid AI response into rounds', async () => {
    const aiResp = JSON.stringify({
      rounds: [
        { question: 'What is it?', answer: 'REACT' },
        { question: 'Another?', answer: 'NATIVE' },
      ],
    })
    ;(callAI as jest.Mock).mockResolvedValue(aiResp)
    const rounds = await generateHangmanRounds('prompt')
    expect(rounds).toHaveLength(2)
    expect(rounds[0].answer).toBe('REACT')
  })

  it('throws when AI returns no valid rounds', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(JSON.stringify({ rounds: [] }))
    await expect(generateHangmanRounds('prompt')).rejects.toThrow()
  })
})
