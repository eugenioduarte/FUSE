import useTrackTopicSession from '@/hooks/use-track-topic-session'

/**
 * useChallengeMatrix
 *
 * Summary:
 * Hook that encapsulates the data, state and interaction logic for the
 * "Matrix" word-search challenge. Responsibilities include loading the
 * challenge and summary metadata, generating the question and target words
 * (using an LLM when available), constructing and measuring the letter grid,
 * handling pan-based selection and hit-testing, and persisting attempts and
 * found words.
 *
 * Behavior notes:
 * - The hook prefers measured page coordinates for hit-testing when the
 *   grid view layout is available; it falls back to nativeEvent location
 *   coordinates when a measurement is not yet ready.
 * - Selection state (`currentPath`) is exposed and a ref copy is maintained
 *   to allow synchronous access inside PanResponder handlers.
 *
 * Author: Eugenio Silva
 */
import { MATRIX_SYSTEM, matrixUserPrompt } from '@/services/prompts'
import { callAI, toJSONSafe } from '@/services/ai/ai.service'
import { challengesRepository } from '@/services/repositories/challenges.repository'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { useAuthStore } from '@/store/auth.store'
import { useOverlay } from '@/store/overlay.store'
import { Challenge } from '@/types/domain'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, PanResponder, View } from 'react-native'

// Constants used by the matrix challenge.
// ALPHABET: letters used to fill the grid's empty cells
// GRID_COLS: the grid width is fixed at 10 columns in this implementation
// TIMER_SECONDS: base timer fallback used until we compute a dynamic time
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const GRID_COLS = 10 // fixed 10 columns
const TIMER_SECONDS = 60

// Safely parse a JSON-like string coming from the LLM response.
// The LLM sometimes returns JSON wrapped in markdown fences or with
// minor formatting issues; this helper strips fences and attempts
// to parse the payload, returning null on failure.


// Generate question + target words for the Matrix challenge.
// This function calls an LLM service (if an API key is configured)
// and expects a JSON response with { question, words } or falls
// back to a mockQA when the model is unavailable or the response
// is malformed.
export async function generateMatrixQA(
  summary: string,
): Promise<{ question: string; words: string[] }> {
  const content = await callAI(
    [
      { role: 'system', content: MATRIX_SYSTEM },
      { role: 'user', content: matrixUserPrompt(summary) },
    ],
    0.4,
  )
  const json = toJSONSafe(content)
  const question = String(json?.question || '').trim()
  const wordsRaw: string[] = Array.isArray(json?.words) ? json.words : []
  const words = wordsRaw
    .map((w) =>
      String(w || '')
        .toUpperCase()
        .split(/[^A-ZÀ-Ý]/g)
        .join('')
        .slice(0, 10),
    )
    .filter((w) => w.length >= 3)
    .slice(0, 5)
  if (!question || words.length < 5)
    throw new Error('Matrix AI returned invalid question/words')
  return { question, words }
}

// Return a random uppercase letter used to fill empty grid cells.
function randomLetter() {
  const i = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET[i]
}

// Place the provided words on a grid with given rows/cols.
// The algorithm attempts random placements horizontally or vertically
// and avoids overwriting conflicting letters. After placing words it
// fills remaining cells with random letters.
function placeWordsOnGrid(words: string[], rows: number, cols: number) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ''),
  )
  const placements: { word: string; cells: { r: number; c: number }[] }[] = []

  const collectCells = (
    word: string,
    r: number,
    c: number,
    dr: number,
    dc: number,
  ): { r: number; c: number }[] | null => {
    const cells: { r: number; c: number }[] = []
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i
      const cc = c + dc * i
      if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) return null
      const cur = grid[rr][cc]
      if (cur && cur !== word[i]) return null
      cells.push({ r: rr, c: cc })
    }
    return cells
  }

  const placeAt = (word: string, cells: { r: number; c: number }[]) => {
    for (let i = 0; i < word.length; i++) {
      const { r, c } = cells[i]
      grid[r][c] = word[i]
    }
    placements.push({ word, cells })
  }

  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const shuffledWords = shuffle(words)

  const tryPlaceWord = (word: string): { r: number; c: number }[] | null => {
    const dirs = shuffle([
      { dr: 0, dc: 1 },
      { dr: 1, dc: 0 },
    ])
    const positions: { r: number; c: number }[] = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) positions.push({ r, c })
    const shuffledPositions = shuffle(positions)
    for (const { dr, dc } of dirs) {
      for (const pos of shuffledPositions) {
        const cells = collectCells(word, pos.r, pos.c, dr, dc)
        if (cells) return cells
      }
    }
    return null
  }

  for (const word of shuffledWords) {
    const cells = tryPlaceWord(word)
    if (cells) placeAt(word, cells)
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) grid[r][c] = randomLetter()
    }
  }

  return { grid, placements }
}

// Hook: useChallengeMatrix
// Encapsulates the state and interactions for the Matrix challenge.
// Responsibilities:
// - Load the challenge and summary metadata
// - Generate question + target words via LLM (or fallback)
// - Compute grid size, place words and fill the grid
// - Handle the pan selection logic (currentPath, hit-testing)
// - Persist attempts and update found words
export default function useChallengeMatrix(
  challengeId: string,
  enableTimer = true,
) {
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()
  // Primary challenge state
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [grid, setGrid] = useState<string[][]>([])
  // placements: list of placed target words with their cell coords
  const [placements, setPlacements] = useState<
    { word: string; cells: { r: number; c: number }[] }[]
  >([])
  const [found, setFound] = useState<string[]>([])
  const [timer, setTimer] = useState(TIMER_SECONDS)
  const total = 5

  // Loading / finished state
  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState<null | {
    score: number
    total: number
  }>(null)
  const meId = useAuthStore((s) => s.user?.id)

  const cellSize = Math.floor((Dimensions.get('window').width - 32) / GRID_COLS)
  const [gridAvailH, setGridAvailH] = useState(0)
  const [gridRows, setGridRows] = useState<number>(0)

  // Selection state: currentPath is the in-progress selection path
  // currentPathRef is kept in a ref for use inside pan handlers where
  // the latest state must be read synchronously without waiting for
  // React state updates.
  const [currentPath, setCurrentPath] = useState<{ r: number; c: number }[]>([])
  const currentPathRef = useRef<{ r: number; c: number }[]>([])
  // Refs for grid DOM/view references and stable copies of grid/words/found
  const gridRef = useRef<View | null>(null)
  const gridDataRef = useRef<string[][]>([])
  const wordsRef = useRef<string[]>([])
  const foundRef = useRef<string[]>([])

  useEffect(() => {
    currentPathRef.current = currentPath
  }, [currentPath])
  useEffect(() => {
    gridDataRef.current = grid
  }, [grid])
  useEffect(() => {
    wordsRef.current = words
  }, [words])
  useEffect(() => {
    foundRef.current = found
  }, [found])

  const foundCellsMemo = useMemo(() => {
    const set = new Set<string>()
    for (const pl of placements) {
      if (!found.includes(pl.word)) continue
      for (const cell of pl.cells) set.add(`${cell.r},${cell.c}`)
    }
    return set
  }, [placements, found])

  const allWordCellsMemo = useMemo(() => {
    const set = new Set<string>()
    for (const pl of placements)
      for (const cell of pl.cells) set.add(`${cell.r},${cell.c}`)
    return set
  }, [placements])

  // Load challenge metadata and generate the Matrix QA payload.
  // Uses an async effect with `active` guard to avoid state updates
  // after unmount.
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true, 'ChallengeRunMatrixScreen')
        const all = await challengesRepository.list()
        const ch = all.find((c) => c.id === challengeId) || null
        if (!active) return
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)

        const summary = await summariesRepository.getById(ch.summaryId)
        if (!active) return
        if (!summary) throw new Error('Summary not found')
        if (active) setTopicId(summary.topicId)

        // Use pre-generated content if available (stored at challenge creation time)
        const preGenQ: string | undefined =
          typeof ch.payload?.question === 'string' && ch.payload.question
            ? ch.payload.question
            : undefined
        const preGenWords: string[] | undefined =
          Array.isArray(ch.payload?.words) && ch.payload.words.length >= 5
            ? (ch.payload.words as string[])
            : undefined

        const qa =
          preGenQ && preGenWords
            ? { question: preGenQ, words: preGenWords }
            : await generateMatrixQA(summary.content)

        setQuestion(qa.question)
        setWords(qa.words)

        // Timer heuristic: 1 minute per letter across target words
        const totalLetters = qa.words.reduce((acc, w) => acc + w.length, 0)
        setTimer(Math.max(60, totalLetters * 60))
        setFound([])
        setLoading(false)
      } catch (e) {
        console.error(e)
        setErrorOverlay(true, 'Não foi possível iniciar o Matrix.')
        setLoading(false)
      } finally {
        setLoadingOverlay(false)
      }
    })()
    return () => {
      active = false
    }
  }, [challengeId, setErrorOverlay, setLoadingOverlay])

  // Track session for this challenge run
  useTrackTopicSession(topicId, 'challenge', challengeId)

  // When we have words and a measured available height, compute rows and place grid
  useEffect(() => {
    if (!words.length || !gridAvailH) return
    const minRows = Math.max(...words.map((w) => w.length), 6)
    const rows = Math.max(minRows, Math.floor(gridAvailH / cellSize))
    setGridRows(rows)
    const { grid: g, placements: pl } = placeWordsOnGrid(words, rows, GRID_COLS)
    setGrid(g)
    setPlacements(pl)
  }, [words, gridAvailH, cellSize])

  // countdown
  useEffect(() => {
    if (!enableTimer) return
    if (loading || finished) return
    if (timer <= 0 || found.length >= total) return
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer, loading, finished, found.length, enableTimer])

  // Persist when finished
  useEffect(() => {
    if (!challenge) return
    const timeIsUp = enableTimer ? timer <= 0 : false
    if (timeIsUp || found.length >= total) {
      const now = Date.now()
      const score = found.length
      const attempt: any = {
        at: now,
        score,
        total,
        userId: meId || undefined,
        question,
        words,
        found,
        grid,
        placements,
      }
      const updated: Challenge = {
        ...challenge,
        updatedAt: now,
        payload: {
          ...challenge.payload,
          attempts: [...(challenge.payload?.attempts ?? []), attempt],
          lastAttempt: { score, total, at: now },
        },
      }
      ;(async () => {
        await challengesRepository.upsert(updated, '/sync/challenge', {
          summaryId: challenge.summaryId,
        })

        setChallenge(updated)
        setFinished({ score, total })
        try {
          setLoadingOverlay(true, 'Sincronizando…')
          const { immediateCollaborativeFlush } = await import(
            '@/services/firebase/immediateFlush'
          )
          await immediateCollaborativeFlush(1500)
        } catch {
        } finally {
          setLoadingOverlay(false)
        }
      })()
    }
  }, [
    timer,
    found,
    total,
    challenge,
    grid,
    placements,
    question,
    words,
    meId,
    setLoadingOverlay,
    enableTimer,
  ])

  const forceFinish = async () => {
    if (!challenge) return
    try {
      setLoadingOverlay(true, 'ChallengeRunMatrixScreen')
      const now = Date.now()
      const score = found.length
      const attempt: any = {
        at: now,
        score,
        total,
        userId: meId || undefined,
        question,
        words,
        found,
        grid,
        placements,
      }
      const updated: Challenge = {
        ...challenge,
        updatedAt: now,
        payload: {
          ...challenge.payload,
          attempts: [...(challenge.payload?.attempts ?? []), attempt],
          lastAttempt: { score, total, at: now },
        },
      }
      await challengesRepository.upsert(updated, '/sync/challenge', {
        summaryId: challenge.summaryId,
      })
      setChallenge(updated)
      setFinished({ score, total })
      try {
        const { immediateCollaborativeFlush } = await import(
          '@/services/firebase/immediateFlush'
        )
        await immediateCollaborativeFlush(1500)
      } catch {}
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingOverlay(false)
    }
  }

  // Measure absolute grid coords for hit testing
  const gridLayoutRef = useRef<{ x: number; y: number } | null>(null)
  const onGridMeasure = () => {
    if (gridRef.current && (gridRef.current as any).measure) {
      ;(gridRef.current as any).measure(
        (
          _x: number,
          _y: number,
          _w: number,
          _h: number,
          pageX: number,
          pageY: number,
        ) => {
          gridLayoutRef.current = { x: pageX, y: pageY }
        },
      )
    }
  }

  const eventToCell = (nativeEvent: any): { r: number; c: number } | null => {
    const layout = gridLayoutRef.current
    if (layout && typeof nativeEvent.pageX === 'number') {
      const gx = nativeEvent.pageX - layout.x
      const gy = nativeEvent.pageY - layout.y
      const c = Math.floor(gx / cellSize)
      const r = Math.floor(gy / cellSize)

      if (r < 0 || c < 0 || r >= gridRows || c >= GRID_COLS) {
        return null
      }
      return { r, c }
    }

    if (
      typeof nativeEvent.locationX === 'number' &&
      typeof nativeEvent.locationY === 'number'
    ) {
      const lx = nativeEvent.locationX
      const ly = nativeEvent.locationY
      const c = Math.floor(lx / cellSize)
      const r = Math.floor(ly / cellSize)
      if (r < 0 || c < 0 || r >= gridRows || c >= GRID_COLS) {
        return null
      }
      return { r, c }
    }

    return null
  }

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (evt) => {
      if (
        !gridLayoutRef.current &&
        gridRef.current &&
        (gridRef.current as any).measure
      ) {
        ;(gridRef.current as any).measure(
          (
            _x: number,
            _y: number,
            _w: number,
            _h: number,
            pageX: number,
            pageY: number,
          ) => {
            gridLayoutRef.current = { x: pageX, y: pageY }
            const cell = eventToCell(evt.nativeEvent)
            setCurrentPath(cell ? [cell] : [])
          },
        )
        return
      }
      const cell = eventToCell(evt.nativeEvent)
      setCurrentPath(cell ? [cell] : [])
    },
    onPanResponderMove: (evt) => {
      if (
        !gridLayoutRef.current &&
        gridRef.current &&
        (gridRef.current as any).measure
      ) {
        ;(gridRef.current as any).measure(
          (
            _x: number,
            _y: number,
            _w: number,
            _h: number,
            pageX: number,
            pageY: number,
          ) => {
            gridLayoutRef.current = { x: pageX, y: pageY }
            const cell = eventToCell(evt.nativeEvent)
            if (!cell) return
            const prev = currentPathRef.current
            const already = prev.some((p) => p.r === cell.r && p.c === cell.c)
            const next = already ? prev : [...prev, cell]

            setCurrentPath(next)
          },
        )
        return
      }
      const cell = eventToCell(evt.nativeEvent)
      if (!cell) return
      const prev = currentPathRef.current
      const already = prev.some((p) => p.r === cell.r && p.c === cell.c)
      const next = already ? prev : [...prev, cell]

      setCurrentPath(next)
    },
    onPanResponderRelease: () => {
      const path = currentPathRef.current
      if (!path.length) return
      const letters = path.map((p) => gridDataRef.current[p.r][p.c])
      const word = letters.join('')
      const matched = placements.some((pl) => {
        if (pl.word !== word) return false
        if (pl.cells.length !== path.length) return false
        for (let i = 0; i < path.length; i++) {
          if (pl.cells[i].r !== path[i].r || pl.cells[i].c !== path[i].c)
            return false
        }
        return true
      })

      if (matched && !foundRef.current.includes(word))
        setFound((f) => (f.includes(word) ? f : [...f, word]))
      setCurrentPath([])
    },
    onPanResponderTerminate: () => {
      setCurrentPath([])
    },
  })

  return {
    loading,
    challenge,
    question,
    words,
    grid,
    placements,
    found,
    timer,
    finished,
    cellSize,
    gridRows,
    gridRef,
    onGridMeasure,
    panHandlers: panResponder.panHandlers,
    forceFinish,
    total,
    foundCellsMemo,
    allWordCellsMemo,
    currentPath,
    setGridAvailH,
  }
}
