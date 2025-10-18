import { TopicCardModel } from '../types/dashboard.type'

const avatars = [
  'https://i.pravatar.cc/100?img=1',
  'https://i.pravatar.cc/100?img=2',
  'https://i.pravatar.cc/100?img=3',
  'https://i.pravatar.cc/100?img=4',
  'https://i.pravatar.cc/100?img=5',
]

const users = (n: number) =>
  Array.from({ length: n }).map((_, i) => ({
    id: `u-${n}-${i}`,
    name: `User ${i + 1}`,
    avatarUrl: avatars[(i + n) % avatars.length],
  }))

const now = new Date()
const iso = (daysAgo: number) =>
  new Date(now.getTime() - 1000 * 60 * 60 * 24 * daysAgo).toISOString()

export const topicsMock: TopicCardModel[] = [
  {
    id: 't1',
    topicName: 'Matemática — Álgebra Linear',
    score: 92,
    createdAt: iso(1),
    spendTime: '1h 20m',
    usersShared: users(3),
  },
  {
    id: 't2',
    topicName: 'História — Revolução Francesa',
    score: 78,
    createdAt: iso(3),
    spendTime: '55m',
    usersShared: users(2),
  },
  {
    id: 't3',
    topicName: 'Programação — Estruturas de Dados',
    score: 88,
    createdAt: iso(7),
    spendTime: '2h 05m',
    usersShared: users(4),
  },
  {
    id: 't4',
    topicName: 'Biologia — Genética',
    score: 81,
    createdAt: iso(10),
    spendTime: '40m',
    usersShared: users(1),
  },
]
