import {
  HANGMAN_SYSTEM,
  KNOWLEDGE_SYSTEM,
  MINI_EXPLAIN_SYSTEM,
  QUIZ_SYSTEM,
  SUMMARY_SYSTEM,
  TEXT_EXERCISES_SYSTEM,
  buildHangmanPrompt,
  buildQuizPrompt,
  buildTextExercisesPrompt,
  knowledgeUserPrompt,
  matrixUserPrompt,
  summaryUserPrompt,
} from '../index'

describe('prompt constants', () => {
  it('MINI_EXPLAIN_SYSTEM is a non-empty string', () => {
    expect(typeof MINI_EXPLAIN_SYSTEM).toBe('string')
    expect(MINI_EXPLAIN_SYSTEM.length).toBeGreaterThan(0)
  })

  it('SUMMARY_SYSTEM instructs to respond in JSON', () => {
    expect(SUMMARY_SYSTEM).toContain('JSON')
    expect(SUMMARY_SYSTEM).toContain('keywords')
  })

  it('KNOWLEDGE_SYSTEM includes expandableTerms key', () => {
    expect(KNOWLEDGE_SYSTEM).toContain('expandableTerms')
  })

  it('QUIZ_SYSTEM is a non-empty string', () => {
    expect(QUIZ_SYSTEM.length).toBeGreaterThan(0)
  })

  it('HANGMAN_SYSTEM is a non-empty string', () => {
    expect(HANGMAN_SYSTEM.length).toBeGreaterThan(0)
  })

  it('TEXT_EXERCISES_SYSTEM is a non-empty string', () => {
    expect(TEXT_EXERCISES_SYSTEM.length).toBeGreaterThan(0)
  })
})

describe('summaryUserPrompt', () => {
  it('includes the subject in the output', () => {
    const prompt = summaryUserPrompt('World War II')
    expect(prompt).toContain('World War II')
  })

  it('asks for 8–14 paragraphs', () => {
    expect(summaryUserPrompt('anything')).toContain('8–14')
  })
})

describe('knowledgeUserPrompt', () => {
  it('includes the subject', () => {
    expect(knowledgeUserPrompt('Photosynthesis')).toContain('Photosynthesis')
  })

  it('includes expandableTerms instruction', () => {
    expect(knowledgeUserPrompt('X')).toContain('expandableTerms')
  })
})

describe('matrixUserPrompt', () => {
  it('embeds the summary text', () => {
    const result = matrixUserPrompt('some summary content')
    expect(result).toContain('some summary content')
  })

  it('instructs for exactly 5 words response', () => {
    expect(matrixUserPrompt('text')).toContain('5')
  })
})

describe('buildQuizPrompt', () => {
  it('includes the total question count', () => {
    const prompt = buildQuizPrompt('study text', 10)
    expect(prompt).toContain('10')
  })

  it('embeds the summary text', () => {
    const prompt = buildQuizPrompt('my summary', 5)
    expect(prompt).toContain('my summary')
  })
})

describe('buildHangmanPrompt', () => {
  it('includes the clamped total (between 2 and 5)', () => {
    const prompt2 = buildHangmanPrompt('text', 1) // clamped to 2
    expect(prompt2).toContain('2')
    const prompt5 = buildHangmanPrompt('text', 10) // clamped to 5
    expect(prompt5).toContain('5')
    const prompt3 = buildHangmanPrompt('text', 3)
    expect(prompt3).toContain('3')
  })

  it('embeds the summary text', () => {
    expect(buildHangmanPrompt('hangman content', 3)).toContain(
      'hangman content',
    )
  })
})

describe('buildTextExercisesPrompt', () => {
  it('includes the total count', () => {
    expect(buildTextExercisesPrompt('content', 7)).toContain('7')
  })

  it('embeds the summary text', () => {
    expect(buildTextExercisesPrompt('base text', 3)).toContain('base text')
  })
})
