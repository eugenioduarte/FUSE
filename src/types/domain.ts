export interface Topic {
  id: string
  title: string
  description?: string
  backgroundColor?: string
  createdBy?: string
  members?: string[]
  createdAt: number
  updatedAt: number
}

export interface Summary {
  id: string
  topicId: string
  authorId?: string
  title?: string
  content: string
  generatedBy: 'user' | 'ai'
  keywords?: string[]
  backgroundColor?: string
  /** Optional parent summary id when this summary was expanded from another */
  parentSummaryId?: string
  /** Terms inside the content that are clickable/expandable */
  expandableTerms?: ExpandableTerm[]
  /** AI suggestions for further exploration */
  recommendations?: string[]
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
  type: 'hangman' | 'matrix' | 'quiz' | 'text'
  title: string
  summaryId: string
  authorId?: string
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

export interface ExpandableTerm {
  term: string
  /** Optional short, 1-2 sentence description for preview/snippet */
  mini?: string
}

export type NotificationType = 'invite'

export interface NotificationInvite {
  id: string
  type: NotificationType
  toUser: string
  fromUser: string
  topicId: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: number
  updatedAt: number
}
