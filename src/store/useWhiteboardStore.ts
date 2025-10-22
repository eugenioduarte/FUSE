import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type {
  EmojiElement,
  IconElement,
  IconShape,
  StrokeElement,
  TextElement,
  Viewport,
  WhiteboardElement,
  WhiteboardMode,
} from '../types/whiteboard.type'

export type WhiteboardState = {
  // Elements on canvas (z-order = array order)
  elements: WhiteboardElement[]
  selectedId: string | null
  mode: WhiteboardMode
  viewport: Viewport

  // Actions
  setMode: (m: WhiteboardMode) => void
  setViewport: (v: Partial<Viewport>) => void
  clearAll: () => void
  deleteSelected: () => void
  select: (id: string | null) => void

  addStroke: (partial?: Partial<StrokeElement>) => string
  appendPointToStroke: (id: string, p: { x: number; y: number }) => void
  addText: (text: string, pos: { x: number; y: number }) => string
  updateText: (id: string, text: string) => void
  addEmoji: (emoji: string, pos: { x: number; y: number }) => string
  addIcon: (
    shape: IconShape,
    pos: { x: number; y: number },
    options?: Partial<
      Pick<IconElement, 'size' | 'color' | 'strokeWidth' | 'fill'>
    >,
  ) => string
  moveElement: (id: string, dx: number, dy: number) => void
  duplicateSelected: () => void
  bringToFront: (id: string) => void

  // Utils
  hitTest: (x: number, y: number) => string | null
}

const uid = () => Math.random().toString(36).slice(2, 10)

const defaultViewport: Viewport = { translateX: 0, translateY: 0, scale: 1 }

// Helpers: hit test per element type
const hitStrokeElement = (
  e: Extract<WhiteboardElement, { type: 'stroke' }>,
  x: number,
  y: number,
): string | null => {
  const pts = e.points
  if (!pts.length) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const p of pts) {
    if (p.x < minX) minX = p.x
    if (p.y < minY) minY = p.y
    if (p.x > maxX) maxX = p.x
    if (p.y > maxY) maxY = p.y
  }
  const pad = Math.max(8, e.width * 2)
  return x >= minX - pad &&
    x <= maxX + pad &&
    y >= minY - pad &&
    y <= maxY + pad
    ? e.id
    : null
}

const hitTextElement = (
  e: Extract<WhiteboardElement, { type: 'text' }>,
  x: number,
  y: number,
): string | null => {
  const w = e.width ?? 160
  const h = e.height ?? e.fontSize * 1.4
  return x >= e.x && x <= e.x + w && y >= e.y && y <= e.y + h ? e.id : null
}

const hitEmojiElement = (
  e: Extract<WhiteboardElement, { type: 'emoji' }>,
  x: number,
  y: number,
): string | null => {
  const size = e.fontSize * 1.2
  return x >= e.x && x <= e.x + size && y >= e.y && y <= e.y + size
    ? e.id
    : null
}

const hitIconElement = (
  e: Extract<WhiteboardElement, { type: 'icon' }>,
  x: number,
  y: number,
): string | null => {
  const size = e.size
  return x >= e.x && x <= e.x + size && y >= e.y && y <= e.y + size
    ? e.id
    : null
}

// Helper: checks if point (x,y) hits element e; returns element id if hit, else null
const hitElement = (
  e: WhiteboardElement,
  x: number,
  y: number,
): string | null => {
  if (e.type === 'stroke') return hitStrokeElement(e, x, y)
  if (e.type === 'text') return hitTextElement(e, x, y)
  if (e.type === 'emoji') return hitEmojiElement(e, x, y)
  if (e.type === 'icon') return hitIconElement(e, x, y)
  return null
}

export const useWhiteboardStore = create<WhiteboardState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedId: null,
      mode: 'select',
      viewport: defaultViewport,

      setMode: (m) => set({ mode: m }),
      setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),

      clearAll: () => set({ elements: [], selectedId: null }),
      deleteSelected: () =>
        set((s) => ({
          elements: s.elements.filter((e) => e.id !== s.selectedId),
          selectedId: null,
        })),
      select: (id) => set({ selectedId: id }),

      addStroke: (partial) => {
        const id = uid()
        const el: StrokeElement = {
          id,
          type: 'stroke',
          x: 0,
          y: 0,
          color: '#111827',
          width: 3,
          points: [],
          ...partial,
        }
        set((s) => ({ elements: [...s.elements, el], selectedId: id }))
        return id
      },

      appendPointToStroke: (id, p) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id && e.type === 'stroke'
              ? { ...e, points: [...e.points, p] }
              : e,
          ),
        })),

      addText: (text, pos) => {
        const id = uid()
        const el: TextElement = {
          id,
          type: 'text',
          x: pos.x,
          y: pos.y,
          text,
          fontSize: 18,
        }
        set((s) => ({ elements: [...s.elements, el], selectedId: id }))
        return id
      },

      updateText: (id, text) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id && e.type === 'text' ? { ...e, text } : e,
          ),
        })),

      addEmoji: (emoji, pos) => {
        const id = uid()
        const el: EmojiElement = {
          id,
          type: 'emoji',
          x: pos.x,
          y: pos.y,
          emoji,
          fontSize: 32,
        }
        set((s) => ({ elements: [...s.elements, el], selectedId: id }))
        return id
      },

      addIcon: (shape, pos, options) => {
        const id = uid()
        const el: IconElement = {
          id,
          type: 'icon',
          x: pos.x,
          y: pos.y,
          shape,
          size: options?.size ?? 64,
          color: options?.color ?? '#111827',
          strokeWidth: options?.strokeWidth ?? 3,
          fill: options?.fill ?? 'transparent',
        }
        set((s) => ({ elements: [...s.elements, el], selectedId: id }))
        return id
      },

      moveElement: (id, dx, dy) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, x: e.x + dx, y: e.y + dy } : e,
          ),
        })),

      duplicateSelected: () =>
        set((s) => {
          const id = s.selectedId
          if (!id) return {}
          const orig = s.elements.find((e) => e.id === id)
          if (!orig) return {}
          const copy = { ...orig, id: uid(), x: orig.x + 24, y: orig.y + 24 }
          return { elements: [...s.elements, copy], selectedId: copy.id }
        }),

      bringToFront: (id) =>
        set((s) => {
          const idx = s.elements.findIndex((e) => e.id === id)
          if (idx < 0) return {}
          const next = [...s.elements]
          const [el] = next.splice(idx, 1)
          next.push(el)
          return { elements: next }
        }),

      hitTest: (x, y) => {
        const els = get().elements
        for (let i = els.length - 1; i >= 0; i--) {
          const res = hitElement(els[i], x, y)
          if (res) return res
        }
        return null
      },
    }),
    {
      name: 'whiteboard-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (s) => ({
        elements: s.elements,
        viewport: s.viewport,
      }),
    },
  ),
)
