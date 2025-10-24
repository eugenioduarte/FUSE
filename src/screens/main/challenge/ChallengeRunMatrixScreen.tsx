import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  RootStackParamList,
  navigatorManager,
} from '../../../navigation/navigatorManager'
import { challengesRepository } from '../../../services/repositories/challenges.repository'
import { summariesRepository } from '../../../services/repositories/summaries.repository'
import { useAuthStore } from '../../../store/useAuthStore'
import { useOverlay } from '../../../store/useOverlay'
import { Challenge } from '../../../types/domain'

// Types persisted for attempts
type MatrixAttempt = {
  at: number
  score: number
  total: number
  question: string
  words: string[]
  found: string[]
  grid: string[][]
  placements: { word: string; cells: { r: number; c: number }[] }[]
}

// Constants
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const GRID_COLS = 10 // fixed 10 columns
const TIMER_SECONDS = 60

// Utils
function toJSONSafe(text: string): any {
  try {
    const cleaned = text
      .replace(/^```(json)?/i, '')
      .replace(/```$/i, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

async function generateMatrixQA(
  summary: string,
): Promise<{ question: string; words: string[] }> {
  try {
    const body = JSON.stringify({
      model: process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Crie uma pergunta objetiva e 5 respostas de uma palavra, relacionadas ao texto. Responda SOMENTE em JSON: { question: string, words: string[5] }',
        },
        {
          role: 'user',
          content: [
            'Gere uma pergunta (ex.: Cite 5 países da América Latina) e 5 palavras exatas como respostas.',
            'Restrições das palavras: apenas letras (sem espaços), até 10 caracteres, maiúsculas.',
            'Retorne SOMENTE JSON válido.',
            'Texto base:\n"""',
            summary,
            '"""',
          ].join('\n'),
        },
      ],
      temperature: 0.4,
    })
    const base =
      process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY
    if (!key) return mockQA()
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body,
    })
    if (!res.ok) return mockQA()
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content?.trim?.() ?? ''
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
    if (!question || words.length !== 5) return mockQA()
    return { question, words }
  } catch (e) {
    console.error(e)
    return mockQA()
  }
}

function mockQA(): { question: string; words: string[] } {
  return {
    question: 'Cite 5 linguagens de programação.',
    words: ['JAVASCRIPT', 'PYTHON', 'RUBY', 'JAVA', 'GO'],
  }
}

function randomLetter() {
  const i = Math.floor(Math.random() * ALPHABET.length)
  return ALPHABET[i]
}

// Random placement into rows x cols with crossing allowed
function placeWordsOnGrid(
  words: string[],
  rows: number,
  cols: number,
): {
  grid: string[][]
  placements: { word: string; cells: { r: number; c: number }[] }[]
} {
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

  const shuffle = <T,>(arr: T[]): T[] => {
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

// Component
const ChallengeRunMatrixScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'ChallengeRunMatrixScreen'>>()
  const challengeId = route.params?.challengeId!
  const { setLoadingOverlay, setErrorOverlay } = useOverlay()

  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [question, setQuestion] = useState('')
  const [words, setWords] = useState<string[]>([])
  const [grid, setGrid] = useState<string[][]>([])
  const [placements, setPlacements] = useState<
    { word: string; cells: { r: number; c: number }[] }[]
  >([])
  const [found, setFound] = useState<string[]>([])
  const [timer, setTimer] = useState(TIMER_SECONDS)
  const total = 5

  const [loading, setLoading] = useState(true)
  const [finished, setFinished] = useState<null | {
    score: number
    total: number
  }>(null)
  const meId = useAuthStore((s) => s.user?.id)

  // Layout/dimensions
  const cellSize = Math.floor((Dimensions.get('window').width - 32) / GRID_COLS)
  const [gridAvailH, setGridAvailH] = useState(0)
  const [gridRows, setGridRows] = useState<number>(0)

  // Selection via pan
  const [currentPath, setCurrentPath] = useState<{ r: number; c: number }[]>([])
  const currentPathRef = useRef<{ r: number; c: number }[]>([])
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

  // Found and testing underline sets
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

  // Load challenge + generate QA
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoadingOverlay(true)
        const all = await challengesRepository.list()
        const ch = all.find((c) => c.id === challengeId) || null
        if (!active) return
        if (!ch) throw new Error('Challenge not found')
        setChallenge(ch)

        const summary = await summariesRepository.getById(ch.summaryId)
        if (!active) return
        if (!summary) throw new Error('Summary not found')

        const qa = await generateMatrixQA(summary.content)
        setQuestion(qa.question)
        setWords(qa.words)
        // Timer: 1 minute per letter across all target words
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
    if (loading || finished) return
    if (timer <= 0 || found.length >= total) return
    const id = setTimeout(() => setTimer((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timer, loading, finished, found.length])

  // Persist when finished
  useEffect(() => {
    if (!challenge) return
    if (timer <= 0 || found.length >= total) {
      const now = Date.now()
      const score = found.length
      const attempt: MatrixAttempt & { userId?: string } = {
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
        // Flush immediately so collaborators see it
        try {
          setLoadingOverlay(true, 'Sincronizando…')
          const { processOfflineQueue } = await import(
            '../../../services/sync/sync.service'
          )
          await processOfflineQueue()
          const { flushLocalCollaborativeChanges } = await import(
            '../../../services/firebase/collabFlush.service'
          )
          await flushLocalCollaborativeChanges()
        } catch {
        } finally {
          setLoadingOverlay(false)
        }
        setChallenge(updated)
        setFinished({ score, total })
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
  ])

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

  const eventToCell = React.useCallback(
    (nativeEvent: any): { r: number; c: number } | null => {
      const layout = gridLayoutRef.current
      if (!layout) return null
      const gx = nativeEvent.pageX - layout.x
      const gy = nativeEvent.pageY - layout.y
      const c = Math.floor(gx / cellSize)
      const r = Math.floor(gy / cellSize)
      if (r < 0 || c < 0 || r >= gridRows || c >= GRID_COLS) return null
      return { r, c }
    },
    [cellSize, gridRows],
  )

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: (evt) => {
          const cell = eventToCell(evt.nativeEvent)
          setCurrentPath(cell ? [cell] : [])
        },
        onPanResponderMove: (evt) => {
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
          // Only accept exact placed-path
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
      }),
    [eventToCell, placements],
  )

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0b0c',
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  if (!challenge) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <Text style={{ color: 'white' }}>Matrix indisponível.</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c' }}>
      {/* Header */}
      <View
        style={{
          padding: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
          {challenge.title}
        </Text>
        <Text style={{ color: '#e5e7eb' }}>{timer}s</Text>
      </View>

      {/* Content without ScrollView */}
      <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
        <Text style={{ color: '#e5e7eb', marginBottom: 8 }}>{question}</Text>
        <Text style={{ color: '#9ca3af', marginBottom: 12 }}>
          [{found.length}/{total}] palavras encontradas
          {found.length ? ` — última: ${found.at(-1)}` : ''}
        </Text>

        {/* Grid space fills the rest of screen */}
        <View
          style={{
            flex: 1,
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
          onLayout={(e) => setGridAvailH(e.nativeEvent.layout.height)}
        >
          {gridRows > 0 && (
            <View
              ref={(r) => {
                gridRef.current = r
              }}
              onLayout={onGridMeasure}
              onStartShouldSetResponderCapture={() => true}
              onResponderTerminationRequest={() => false}
              {...panResponder.panHandlers}
              style={{
                width: cellSize * GRID_COLS,
                height: cellSize * gridRows,
                backgroundColor: '#111214',
                borderColor: '#2B2C30',
                borderWidth: 1,
                borderRadius: 8,
              }}
            >
              {grid.map((row, rIdx) => {
                const rowKey = row.join('') || `row-${rIdx}`
                return (
                  <View key={rowKey} style={{ flexDirection: 'row' }}>
                    {row.map((ch, cIdx) => {
                      const inPath = currentPath.some(
                        (p) => p.r === rIdx && p.c === cIdx,
                      )
                      const isFoundCell = foundCellsMemo.has(`${rIdx},${cIdx}`)
                      const bg = isFoundCell
                        ? '#34d399'
                        : inPath
                          ? '#4b5563'
                          : 'transparent'
                      const border = isFoundCell ? '#10b981' : '#2B2C30'
                      const cellKey = `${ch}-${rIdx}-${cIdx}`
                      return (
                        <View
                          key={cellKey}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 0.5,
                            borderColor: border,
                            backgroundColor: bg,
                          }}
                        >
                          <Text
                            style={{
                              color: 'white',
                              fontWeight: '700',
                              textDecorationLine: allWordCellsMemo.has(
                                `${rIdx},${cIdx}`,
                              )
                                ? 'underline'
                                : 'none',
                            }}
                          >
                            {ch}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                )
              })}
            </View>
          )}
        </View>

        {/* Results CTA when done */}
        {/* Results CTA removed: overlay appears automaticamente quando terminar */}
      </View>

      {/* Finished overlay CTA */}
      {finished && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)',
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
          />
          <View
            style={{
              backgroundColor: '#0b0b0c',
              padding: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#2B2C30',
              width: '80%',
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '800',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Resultado
            </Text>
            <Text style={{ color: '#e5e7eb', textAlign: 'center' }}>
              Você marcou {finished.score} de {finished.total}
            </Text>
            <View style={{ height: 12 }} />
            <TouchableOpacity
              onPress={() =>
                navigatorManager.goToChallengesList({
                  summaryId: challenge.summaryId,
                })
              }
              style={{
                backgroundColor: '#10b981',
                borderRadius: 10,
                paddingVertical: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                Voltar para a lista
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

export default ChallengeRunMatrixScreen
