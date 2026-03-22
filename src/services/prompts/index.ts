// Centralized AI prompts used across the app.
//
// NOTE: Each constant or builder below is documented with a short description
// of what the prompt is for, the expected response shape (especially when the
// AI must return JSON), and the primary places in the codebase that consume
// the prompt. Keep these comments up-to-date when you change the prompts or
// move usages.

/**
 * MINI_EXPLAIN_SYSTEM
 * -------------------
 * Purpose: System prompt instructing the AI to produce very short (1–2
 * sentences) explanations.
 * Expected output: short textual explanation (plain text).
 * Primary usages: used by `src/services/ai/ai.service.ts` when the app needs a
 * concise clarification or quick explanation for a concept (mini-explain
 * feature / tooltips).
 */
export const MINI_EXPLAIN_SYSTEM =
  'You write short (1-2 sentence), clear and objective explanations.'

/**
 * SUMMARY_SYSTEM
 * --------------
 * Purpose: System prompt for generating a study summary.
 * Expected output: JSON only with keys: { title: string, content: string, keywords: string[] }.
 * Primary usages: consumed by `src/services/ai/ai.service.ts` when creating the
 * main text summaries shown in the Summary screen and persisted to the
 * summaries repository.
 */
export const SUMMARY_SYSTEM =
  'You are an assistant that creates structured and in-depth study summaries. Respond ONLY in JSON with the keys: title, content, keywords (array of strings). No additional text.'

/**
 * KNOWLEDGE_SYSTEM
 * ----------------
 * Purpose: System prompt for a richer "knowledge" summary aimed at study use.
 * Expected output: JSON only with keys: {
 *   title: string,
 *   content: string,
 *   keywords: string[],
 *   expandableTerms: Array<{ term: string, mini: string }>,
 *   recommendations: string[]
 * }.
 * Primary usages: used by `src/services/ai/ai.service.ts` when generating a
 * study-oriented summary that includes terms to expand and study
 * recommendations (used in screens that show expandable term tooltips).
 */
export const KNOWLEDGE_SYSTEM =
  'You create structured and in-depth study summaries. Respond ONLY in JSON with the keys: title, content, keywords (string[]), expandableTerms (array of {term, mini}), recommendations (string[]). Nothing beyond the JSON.'

/**
 * summaryUserPrompt(subject)
 * --------------------------
 * Purpose: Builds the user (content) prompt for the summary flow.
 * Expected input: subject (short string describing the topic to summarize).
 * Expected output: the combined user prompt string to send to the AI.
 * Primary usages: called by `src/services/ai/ai.service.ts` before requesting
 * a summary for a given subject.
 */
export function summaryUserPrompt(subject: string) {
  return (
    `Generate a complete, didactic, and detailed summary about: "${subject}".` +
    '\n- Structure it in 8–14 paragraphs (short to medium length).' +
    '\n- Go in depth on details (definitions, historical context, causes and effects, comparisons, practical examples, and numbers/dates when applicable).' +
    '\n- If applicable, describe steps, recommendations, or best practices.' +
    '\n- End with a synthesis/conclusion paragraph.' +
    '\n- Include relevant keywords (8–16) that could become sub-summaries.'
  )
}

/**
 * knowledgeUserPrompt(subject)
 * ----------------------------
 * Purpose: Builds the user prompt for the KNOWLEDGE_SYSTEM.
 * Primary usages: used by `src/services/ai/ai.service.ts` when a knowledge-style
 * summary is required.
 */
export function knowledgeUserPrompt(subject: string) {
  return (
    `Topic: "${subject}".` +
    '\n- Produce a didactic and detailed summary (8–14 short to medium paragraphs).' +
    '\n- Go in depth on definitions, context, examples, cause/effect relationships, pros and cons when applicable; use dates/values only when appropriate.' +
    '\n- Include a final synthesis.' +
    '\n- Choose 10–18 terms/expressions worth expanding and provide a mini explanation (1–2 sentences) for each in expandableTerms.' +
    '\n- Suggest 5–10 expansion paths in "recommendations".'
  )
}

// Matrix (word search / 5-word QA)
/**
 * MATRIX_SYSTEM
 * -------------
 * Purpose: System prompt for the "matrix" activity (short objective
 * question and 5 one-word answers). The AI must return a small JSON with a
 * question and exactly 5 uppercase single-word answers.
 * Expected output: { question: string, words: string[5] } (JSON only).
 * Primary usages: consumed by `src/hooks/useChallengeMatrix.ts` to create the
 * matrix/word-search-like challenge from a summary.
 */
export const MATRIX_SYSTEM =
  'Create an objective question and 5 one-word answers related to the text. Respond ONLY in JSON: { question: string, words: string[5] }'

/**
 * matrixUserPrompt(summary)
 * ------------------------
 * Purpose: Builds the user prompt text for the MATRIX_SYSTEM from the
 * provided summary text.
 * Primary usages: `src/hooks/useChallengeMatrix.ts`.
 */
export function matrixUserPrompt(summary: string) {
  return [
    'Generate a question (e.g.: Name 5 countries in Latin America) and 5 exact words as answers.',
    'Word restrictions: letters only (no spaces), up to 10 characters, uppercase.',
    'Return ONLY valid JSON.',
    'Base text:\n"""',
    summary,
    '"""',
  ].join('\n')
}

/**
 * Quiz prompts
 * ------------
 * Purpose: Collection of prompts and builders to generate multiple-choice
 * quizzes from a study text.
 * Primary usages: `src/screens/main/challenge/hooks/useChallengeRunQuiz.ts`
 * and quiz UI components.
 */
export function buildQuizPrompt(summaryText: string, total: number) {
  return [
    'You are an assistant that creates multiple-choice quizzes from a study text.',
    'Respond ONLY in JSON with the key: questions (array).',
    'Each item in questions must have:',
    '- question: string;',
    '- options: array of 5 items, each item: { text: string; correct: boolean; explanation: string }',
    `Generate exactly ${total} questions.`,
    'The study text is as follows:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

export const QUIZ_SYSTEM =
  'You create quizzes. Respond ONLY in JSON with { questions: Array } as specified.'

// Hangman prompts
export function buildHangmanPrompt(summaryText: string, total: number) {
  return [
    'You will create Hangman challenges based on the study text.',
    'Respond ONLY in JSON with the key: rounds (array).',
    'Each item in rounds must have:',
    '- question: string (the question or hint)',
    '- answer: string (a single word, letters only, up to 10 characters, no spaces)',
    `Generate exactly ${Math.max(2, Math.min(5, total))} items.`,
    'Base yourself exclusively on the text below:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

export const HANGMAN_SYSTEM =
  'You generate Hangman rounds. Respond ONLY in JSON with { rounds: Array<{question, answer}> }.'

// Text answer / open exercises
export const TEXT_EXERCISES_SYSTEM =
  'Create open-ended questions (discursive answers) about the text. Respond ONLY in JSON: { exercises: Array<{ question: string, correctAnswer: string }> }.'

export const TEXT_EXERCISES_HINT =
  'Include for each one a concise and objective correct answer. Respond only in valid JSON.'

export const TEXT_EVALUATION_PROMPT =
  'Evaluate the student\'s answer. Respond ONLY in JSON: { score: number (0-10), feedback?: string }'

export function buildTextExercisesPrompt(summary: string, total: number) {
  return [
    `Generate exactly ${total} elaborated questions requiring a discursive answer.`,
    'Include for each one a concise and objective correct answer. Respond only in valid JSON.',
    'Base text:\n"""',
    summary,
    '"""',
  ].join('\n')
}
