import { act, renderHook, waitFor } from '@testing-library/react-native'
import useChallengeRunTextAnswer, {
  generateOpenQuestionSet,
  TAExercise,
} from '../challenge-run-text-answer.hook'

// ---

import { navigatorManager } from '@/navigation/navigator-manager'
import { callAI } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'

// --- fixtures ---
const CHALLENGE_ID = 'ch-ta-1'

const EXERCISES: TAExercise[] = [
  { question: 'Explain X', correctAnswer: 'X is about ...' },
  { question: 'What is Y?', correctAnswer: 'Y stands for ...' },
]

const MOCK_CHALLENGE = {
  id: CHALLENGE_ID,
  summaryId: 'sum-1',
  payload: {
    exercises: EXERCISES,
    totalExercises: 2,
    perExerciseSeconds: 120,
  },
}

const MOCK_SUMMARY = { topicId: 'topic-1', content: 'Summary content.' }

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

jest.mock('@/navigation/navigator-manager', () => ({
  navigatorManager: {
    goToChallengeFinishedScore: jest.fn(),
  },
}))

jest.mock('@/services/firebase/immediate-flush', () => ({
  immediateCollaborativeFlush: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/services/prompts', () => ({
  TEXT_EXERCISES_SYSTEM: 'SYSTEM',
  buildTextExercisesPrompt: jest.fn(() => 'prompt'),
  TEXT_EVALUATION_PROMPT: 'EVAL_SYSTEM',
  buildQuizPrompt: jest.fn(),
  QUIZ_SYSTEM: '',
  HANGMAN_SYSTEM: '',
  buildHangmanPrompt: jest.fn(),
}))

function setupMocks() {
  ;(challengesRepository.list as jest.Mock).mockResolvedValue([MOCK_CHALLENGE])
  ;(summariesRepository.getById as jest.Mock).mockResolvedValue(MOCK_SUMMARY)
}

describe('useChallengeRunTextAnswer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('starts with loading=true', () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    expect(result.current.loading).toBe(true)
  })

  it('loads challenge and exercises from payload', async () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.challenge?.id).toBe(CHALLENGE_ID)
    expect(result.current.exercises).toHaveLength(2)
    expect(result.current.totalExercises).toBe(2)
  })

  it('starts at step 0 with empty answer', async () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.step).toBe(0)
    expect(result.current.answer).toBe('')
  })

  it('canSubmit is false when answer is too short', async () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setAnswer('short'))
    expect(result.current.canSubmit).toBe(false)
  })

  it('canSubmit is true when answer has >= 30 chars', async () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setAnswer('A'.repeat(30)))
    expect(result.current.canSubmit).toBe(true)
  })

  it('canSubmit is false once evaluated', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({ score: 8, feedback: 'Good' }),
    )
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setAnswer('A'.repeat(30)))
    await act(() => result.current.doSubmit())
    expect(result.current.evaluated?.score).toBe(8)
    expect(result.current.canSubmit).toBe(false)
  })

  it('doSubmit populates attemptItems', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({ score: 5, feedback: 'OK' }),
    )
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setAnswer('A'.repeat(30)))
    await act(() => result.current.doSubmit())
    expect(result.current.attemptItems).toHaveLength(1)
    expect(result.current.attemptItems[0].score).toBe(5)
  })

  it('onContinue advances to next step and resets answer/evaluated', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({ score: 7, feedback: 'Nice' }),
    )
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.setAnswer('B'.repeat(30)))
    await act(() => result.current.doSubmit())
    await act(() => result.current.onContinue())
    expect(result.current.step).toBe(1)
    expect(result.current.answer).toBe('')
    expect(result.current.evaluated).toBeNull()
  })

  it('onContinue at last step navigates to finished screen', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(
      JSON.stringify({ score: 6, feedback: 'OK' }),
    )
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    // exercise 1
    act(() => result.current.setAnswer('A'.repeat(30)))
    await act(() => result.current.doSubmit())
    await act(() => result.current.onContinue())
    // exercise 2
    act(() => result.current.setAnswer('B'.repeat(30)))
    await act(() => result.current.doSubmit())
    await act(() => result.current.onContinue())
    expect(navigatorManager.goToChallengeFinishedScore).toHaveBeenCalledWith(
      expect.objectContaining({ total: 10 }),
    )
    expect(challengesRepository.upsert).toHaveBeenCalled()
  })

  it('forceFinish persists attempt and navigates', async () => {
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(() => result.current.forceFinish())
    expect(challengesRepository.upsert).toHaveBeenCalled()
    expect(navigatorManager.goToChallengeFinishedScore).toHaveBeenCalled()
  })

  it('shows error overlay when challenge is not found', async () => {
    ;(challengesRepository.list as jest.Mock).mockResolvedValue([])
    const { result } = renderHook(() => useChallengeRunTextAnswer(CHALLENGE_ID))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(mockSetErrorOverlay).toHaveBeenCalled()
  })
})

describe('generateOpenQuestionSet', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns parsed exercises from AI response', async () => {
    const aiResp = JSON.stringify({
      exercises: [
        { question: 'Q1?', correctAnswer: 'Ans1' },
        { question: 'Q2?', correctAnswer: 'Ans2' },
      ],
    })
    ;(callAI as jest.Mock).mockResolvedValue(aiResp)
    const exercises = await generateOpenQuestionSet('summary', 2)
    expect(exercises).toHaveLength(2)
    expect(exercises[0].question).toBe('Q1?')
  })

  it('throws when no valid exercises are returned', async () => {
    ;(callAI as jest.Mock).mockResolvedValue(JSON.stringify({ exercises: [] }))
    await expect(generateOpenQuestionSet('summary', 5)).rejects.toThrow()
  })
})
