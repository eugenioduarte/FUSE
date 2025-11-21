// Centralized AI prompts used across the app.
// Keep prompts in Portuguese where the UI/content is PT-BR.
//
// NOTE: Each constant or builder below is documented with a short English
// description describing what the prompt is for, the expected response shape
// (especially when the AI must return JSON), and the primary places in the
// codebase that consume the prompt. Keep these comments up-to-date when you
// change the prompts or move usages.

/**
 * MINI_EXPLAIN_SYSTEM
 * -------------------
 * Purpose: System prompt instructing the AI to produce very short (1–2
 * sentences) explanations in Brazilian Portuguese.
 * Expected output: short textual explanation (plain text).
 * Primary usages: used by `src/services/ai/ai.service.ts` when the app needs a
 * concise clarification or quick explanation for a concept (mini-explain
 * feature / tooltips).
 */
export const MINI_EXPLAIN_SYSTEM =
  'Você escreve explicações curtas (1-2 frases) e objetivas em PT-BR.'

/**
 * SUMMARY_SYSTEM
 * --------------
 * Purpose: System prompt for generating a study summary in PT-BR.
 * Expected output: JSON only with keys: { title: string, content: string, keywords: string[] }.
 * Primary usages: consumed by `src/services/ai/ai.service.ts` when creating the
 * main text summaries shown in the Summary screen and persisted to the
 * summaries repository.
 */
export const SUMMARY_SYSTEM =
  'Você é um assistente que cria resumos estruturados e aprofundados em PT-BR. Responda SOMENTE em JSON com as chaves: title, content, keywords (array de strings). Sem textos adicionais.'

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
  'Você cria resumos estruturados e aprofundados em PT-BR para estudo. Responda SOMENTE em JSON com as chaves: title, content, keywords (string[]), expandableTerms (array de {term, mini}), recommendations (string[]). Nada além do JSON.'

/**
 * summaryUserPrompt(subject)
 * --------------------------
 * Purpose: Builds the user (content) prompt for the summary flow. It provides
 * instructions and the subject to the AI (appended to the SUMMARY_SYSTEM).
 * Expected input: subject (short string describing the topic to summarize).
 * Expected output: the combined user prompt string to send to the AI.
 * Primary usages: called by `src/services/ai/ai.service.ts` before requesting
 * a summary for a given subject.
 */

export function summaryUserPrompt(subject: string) {
  return (
    `Gere um resumo completo, didático e mais extenso sobre: "${subject}".` +
    '\n- Estruture em 8–14 parágrafos (curtos a médios).' +
    '\n- Aprofunde detalhes (definições, contexto histórico, causas e consequências, comparações, exemplos práticos e números/datas quando aplicável).' +
    '\n- Se fizer sentido, descreva etapas, recomendações ou boas práticas.' +
    '\n- Finalize com um parágrafo de síntese/conclusão.' +
    '\n- Inclua keywords relevantes (8–16) que poderiam virar sub-resumos.'
  )
}

/**
 * knowledgeUserPrompt(subject)
 * ----------------------------
 * Purpose: Builds the user prompt for the KNOWLEDGE_SYSTEM. It asks the AI
 * to generate a study-oriented summary with expandable terms and
 * recommendations.
 * Primary usages: used by `src/services/ai/ai.service.ts` when a knowledge-style
 * summary is required.
 */

export function knowledgeUserPrompt(subject: string) {
  return (
    `Tema: "${subject}".` +
    '\n- Produza um resumo didático e mais detalhado (8–14 parágrafos curtos a médios).' +
    '\n- Aprofunde definições, contexto, exemplos, relações de causa/efeito, prós e contras quando fizer sentido; use datas/valores apenas quando apropriado.' +
    '\n- Inclua uma síntese final.' +
    '\n- Escolha 10–18 termos/expressões que mereçam expansão e forneça uma mini (1–2 frases) para cada em expandableTerms.' +
    '\n- Sugira 5–10 caminhos de expansão em "recommendations".'
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
  'Crie uma pergunta objetiva e 5 respostas de uma palavra, relacionadas ao texto. Responda SOMENTE em JSON: { question: string, words: string[5] }'

/**
 * matrixUserPrompt(summary)
 * ------------------------
 * Purpose: Builds the user prompt text for the MATRIX_SYSTEM from the
 * provided summary text. It enforces formatting rules for the answer words.
 * Primary usages: `src/hooks/useChallengeMatrix.ts`.
 */

export function matrixUserPrompt(summary: string) {
  return [
    'Gere uma pergunta (ex.: Cite 5 países da América Latina) e 5 palavras exatas como respostas.',
    'Restrições das palavras: apenas letras (sem espaços), até 10 caracteres, maiúsculas.',
    'Retorne SOMENTE JSON válido.',
    'Texto base:\n"""',
    summary,
    '"""',
  ].join('\n')
}

/**
 * Quiz prompts
 * ------------
 * Purpose: Collection of prompts and builders to generate multiple-choice
 * quizzes from a study text. The quiz builder asks the AI to return JSON
 * with a `questions` array where each question contains the required
 * structure (question, options with text/correct/explanation).
 * Primary usages: `src/screens/main/challenge/hooks/useChallengeRunQuiz.ts`
 * and quiz UI components.
 */
// Quiz prompts
export function buildQuizPrompt(summaryText: string, total: number) {
  return [
    'Você é um assistente que cria quizzes de múltipla escolha a partir de um texto de estudo.',
    'Responda SOMENTE em JSON com a chave: questions (array).',
    'Cada item de questions deve ter:',
    '- question: string;',
    '- options: array de 5 itens, cada item: { text: string; correct: boolean; explanation: string }',
    `Gere exatamente ${total} perguntas.`,
    'O texto de estudo é o seguinte:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

/**
 * buildQuizPrompt(summaryText, total)
 * ---------------------------------
 * Purpose: Creates a user prompt instructing the AI to produce a multiple
 * choice quiz based on the provided summary text.
 * Expected output: JSON only with { questions: [...] } where each question
 * object has question, options (5 items with text, correct, explanation).
 * Primary usages: `src/screens/main/challenge/hooks/useChallengeRunQuiz.ts`
 * and quiz-related screens that render multiple-choice questions.
 */

export const QUIZ_SYSTEM =
  'Você cria quizzes. Responda SOMENTE em JSON com { questions: Array } conforme especificado.'

/**
 * QUIZ_SYSTEM
 * ----------
 * Purpose: System-level instruction for quiz generation. Enforces JSON-only
 * response structure for quiz building.
 */

// Hangman prompts
export function buildHangmanPrompt(summaryText: string, total: number) {
  return [
    'Você criará desafios de Hangman baseados no texto de estudo.',
    'Responda SOMENTE em JSON com a chave: rounds (array).',
    'Cada item de rounds deve ter:',
    '- question: string (a pergunta ou dica)',
    '- answer: string (apenas uma palavra, somente letras, até 10 caracteres, sem espaços)',
    `Gere exatamente ${Math.max(2, Math.min(5, total))} itens.`,
    'Baseie-se exclusivamente no texto abaixo:',
    '"""',
    summaryText,
    '"""',
  ].join('\n')
}

/**
 * buildHangmanPrompt(summaryText, total)
 * -------------------------------------
 * Purpose: Builds a user prompt instructing the AI to create Hangman rounds
 * (short hints/questions and single-word answers) from a study text.
 * Expected output: JSON only with { rounds: [{ question, answer }, ...] }.
 * Constraints: answers should be single words (letters only), <= 10 chars.
 * Primary usages: `src/screens/main/challenge/hooks/useChallengeRunHangman.ts`
 * which drives the Hangman game.
 */

export const HANGMAN_SYSTEM =
  'Você gera rounds de Hangman. Responda SOMENTE em JSON com { rounds: Array<{question, answer}> }.'

/**
 * HANGMAN_SYSTEM
 * --------------
 * Purpose: System prompt for Hangman round generation. Enforces JSON-only
 * { rounds: Array<{question, answer}> } output.
 */

// Text answer / open exercises
export const TEXT_EXERCISES_SYSTEM =
  'Crie perguntas abertas (respostas discursivas) sobre o texto. Responda SOMENTE em JSON: { exercises: Array<{ question: string, correctAnswer: string }> }.'

/**
 * TEXT_EXERCISES_SYSTEM
 * ---------------------
 * Purpose: System prompt to generate open-ended (essay/discursive) exercises
 * from a study text.
 * Expected output: JSON only with { exercises: [ { question, correctAnswer } ] }.
 * Primary usages: `src/screens/main/challenge/ChallengeRunTextAnswerScreen.tsx`
 * where open-answer exercises are presented and later evaluated.
 */

export const TEXT_EXERCISES_HINT =
  'Inclua para cada uma a resposta correta concisa e objetiva. Responda somente em JSON válido.'

/**
 * TEXT_EXERCISES_HINT
 * -------------------
 * Purpose: Supplemental instruction used with TEXT_EXERCISES_SYSTEM to force
 * concise correct answers to be included in the JSON response.
 */

export const TEXT_EVALUATION_PROMPT =
  'Avalie a resposta do aluno. Responda SOMENTE JSON: { score: number (0-10), feedback?: string }'

/**
 * TEXT_EVALUATION_PROMPT
 * ----------------------
 * Purpose: Prompt template used to instruct the AI to evaluate a student's
 * open answer. Expected output: JSON only with { score: number (0-10),
 * feedback?: string }.
 * Primary usages: evaluation logic in text-answer screens/hooks that grade
 * student responses and show feedback.
 */

export function buildTextExercisesPrompt(summary: string, total: number) {
  return [
    `Gere exatamente ${total} perguntas elaboradas que exijam resposta discursiva.`,
    'Inclua para cada uma a resposta correta concisa e objetiva. Responda somente em JSON válido.',
    'Texto base:\n"""',
    summary,
    '"""',
  ].join('\n')
}

/**
 * buildTextExercisesPrompt(summary, total)
 * --------------------------------------
 * Purpose: Build the user prompt that asks the AI to create `total`
 * open-ended exercises based on the provided summary text. Each exercise must
 * include a concise correct answer.
 * Primary usages: `src/screens/main/challenge/ChallengeRunTextAnswerScreen.tsx`.
 */
