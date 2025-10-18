export type CalendarCommitment = {
  id: string
  topicId: string
  title: string
  location?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  createdAt: number
  updatedAt: number
}
