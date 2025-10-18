export type TopicCardUser = {
  id: string
  name: string
  avatarUrl: string
}

export type TopicCardModel = {
  id: string
  topicName: string
  score: number
  createdAt: string
  spendTime: string
  usersShared: TopicCardUser[]
}
