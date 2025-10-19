export type CalendarCommitment = {
  id: string
  topicId?: string
  summaryId?: string
  title: string
  description?: string
  location?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  createdAt: number
  updatedAt: number
}
