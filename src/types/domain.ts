export interface Topic {
  id: string
  title: string
  description?: string
  createdAt: number
  updatedAt: number
}

export interface Summary {
  id: string
  topicId: string
  content: string
  generatedBy: 'user' | 'ai'
  createdAt: number
  updatedAt: number
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface Challenge {
  id: string
  type: 'flashcard' | 'hangman' | 'matrix' | 'quiz' | 'text'
  title: string
  payload: any
  createdAt: number
  updatedAt: number
}

export interface PostDescriptor {
  id: string
  resource: 'topic' | 'summary' | 'calendar' | 'challenge'
  payload: any
  createdAt: number
}
