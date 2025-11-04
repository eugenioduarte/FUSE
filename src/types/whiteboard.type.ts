export type Viewport = {
  translateX: number
  translateY: number
  scale: number
}

export type BaseElement = {
  id: string
  type: 'stroke' | 'text' | 'emoji' | 'icon'
  x: number
  y: number
  rotation?: number
  scale?: number
}

export type StrokeElement = BaseElement & {
  type: 'stroke'
  color: string
  width: number
  points: { x: number; y: number }[]
}

export type TextElement = BaseElement & {
  type: 'text'
  text: string
  fontSize: number
  width?: number
  height?: number
}

export type EmojiElement = BaseElement & {
  type: 'emoji'
  emoji: string
  fontSize: number
}

export type IconShape = 'arrow' | 'circle' | 'rect'

export type IconElement = BaseElement & {
  type: 'icon'
  shape: IconShape
  size: number
  color: string
  strokeWidth?: number
  fill?: string
}
