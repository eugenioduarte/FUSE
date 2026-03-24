import { act, renderHook, waitFor } from '@testing-library/react-native'
import useChallengeRunQuiz, {
  AIQuizQuestion,
  generateQuiz,
} from '../challenge-run-quiz.hook'

// ---

import { callAI } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'

// --- shared fixtures ---
const CHALLENGE_ID = 'ch-quiz-1'

const makeQuestion = (
  questionText: string,
  correctIdx: number,
): AIQuizQuestion => ({
  question: questionText,
  options: [
    { text: 'A', correct: correctIdx === 0, explanation: 'exA' },
    { text: 'B', correct: correctIdx === 1, explanation: 'exB' },
    { text: 'C', correct: correctIdx === 2, explanation: 'exC' },
    { text: 'D', correct: correctIdx === 3, explanation: 'exD' },
  ],
})

const q1 = makeQuestion('What is X?', 0) // correct = option 0
const q2 = makeQuestion('What is Y?', 1) // correct = option 1

const MOCK_CHALLENGE = {
  id: CHALLENGE_ID,
  summaryId: 'sum-1',
  payload: { questions: [q1, q2] },
}

const MOCK_SUMMARY = { topicId: 'topic-1', content: 'Content text.' }
const MOCK_TOPIC = { backgroundColor: '#ff0000' }

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

jest.mock('@/services/usage/usage-tracker', () => ({
  startSession: jest.fn().mockResolvedValue('session-key'),
  stopSessionByKey: jest.fn(),
}))

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((cb) => cb()),
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

jest.mock('@/services/prompts', () => ({
  buildQuizPrompt: jest.fn(() => 'quiz-prompt'),
  QUIZ_SYSTEM: 'QUIZ_SYSTEM_PROMPT',
  HANGMAN_SYSTEM: '',
  buildHangmanPrompt: jest.fn(),
  TEXT_EXERCISES_SYSTEM: '',
  buildTextExercisesPrompt: jest.fn(),
  TEXT_EVALUATION_PROMPT: '',
}))

function setupMocks() {
  ;(challengesRepository.list as jest.Mock).mockResolvedValue([MOCK_CHALLENGE])
  ;(summariesRepository.getById as jest.Mock).mockResolvedValue(MOCK_SUMMARY)
  ;(topicsRepository.getById as jest.Mock).mockResolvedValue(MOCK_TOPIC)
}

describe('useChallengeRunQuiz', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    expect(result.current.loading).toBe(true)
  })

  it('loads challenge and questions from pre-generated payload', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.challenge?.id).toBe(CHALLENGE_ID)
    expect(result.current.questions).toHaveLength(2)
  })

  it('sets topicColor from topic repository', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.topicColor).toBe('#ff0000')
  })

  it('initialises step at 0 and finished as null', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.step).toBe(0)
    expect(result.current.finished).toBeNull()
  })

  it('canContinue is false before any selection', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.canContinue).toBe(false)
  })

  it('onSelect records the first choice and enables canContinue', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onSelect(2))
    expect(result.current.currentChoice).toBe(2)
    expect(result.current.firstChoiceByIndex[0]).toBe(2)
    expect(result.current.canContinue).toBe(true)
  })

  it('onSelect ignores subsequent taps for the same step', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onSelect(1))
    act(() => result.current.onSelect(3))
    expect(result.current.firstChoiceByIndex[0]).toBe(1)
  })

  it('onContinue advances to next step', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onSelect(0))
    await act(() => result.current.onContinue())
    expect(result.current.step).toBe(1)
    expect(result.current.currentChoice).toBeNull()
  })

  it('isLast is true on the last question', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onSelect(0))
    await act(() => result.current.onContinue())
    expect(result.current.isLast).toBe(true)
  })

  it('onContinue at last step computes score and sets finished', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // step 0: select correct option (accounting for shuffle)
    const correct0 = result.current.questions[0].options.findIndex(
      (o) => o.correct,
    )
    act(() => result.current.onSelect(correct0))
    await act(() => result.current.onContinue())
    // step 1: select wrong option
    const wrong1 = result.current.questions[1].options.findIndex(
      (o) => !o.correct,
    )
    act(() => result.current.onSelect(wrong1))
    await act(() => result.current.onContinue())
    expect(result.current.finished).toEqual({ score: 1, total: 2 })
  })

  it('forceFinish computes score and sets finished', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // find correct option index after shuffle
    const correctIdx = result.current.questions[0].options.findIndex(
      (o) => o.correct,
    )
    act(() => result.current.onSelect(correctIdx))
    await act(() => result.current.forceFinish())
    expect(result.current.finished).toEqual({ score: 1, total: 2 })
  })

  it('upserts the challenge on finish', async () => {
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.onSelect(0))
    await act(() => result.current.onContinue())
    act(() => result.current.onSelect(1))
    await act(() => result.current.onContinue())
    expect(challengesRepository.upsert).toHaveBeenCalledTimes(1)
  })

  it('shows error overlay when challenge is not found', async () => {
    ;(challengesRepository.list as jest.Mock).mockResolvedValue([])
    const { result } = renderHook(() => useChallengeRunQuiz(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockSetErrorOverlay).toHaveBeenCalled()
  })
})

describe('generateQuiz', () => {
  beforeEach(() => jest.clearAllMocks())

  it('parses valid AI response into questions array', async () => {
    const aiResp = JSON.stringify({
      questions: [
        {
          question: 'Q1?',
          options: [
            { text: 'A', correct: true, explanation: 'ex' },
            { text: 'B', correct: false, explanation: 'ex' },
            { text: 'C', correct: false, explanation: 'ex' },
            { text: 'D', correct: false, explanation: 'ex' },
          ],
        },
      ],
    })
    ;(callAI as jest.Mock).mockResolvedValue(aiResp)
    const result = await generateQuiz('test prompt')
    expect(result.questions).toHaveLength(1)
    expect(result.questions[0].question).toBe('Q1?')
  })

  it('throws when AI returns no valid questions', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(JSON.stringify({ questions: [] }))
    await expect(generateQuiz('p')).rejects.toThrow()
  })

  it('throws when AI returns unexpected format', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(JSON.stringify({ data: 'bad' }))
    await expect(generateQuiz('p')).rejects.toThrow()
  })
})
