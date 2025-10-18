import { CalendarCommitment } from '../types/calendar.type'

const now = Date.now()
const baseDate = '2024-10-01'

export const calendarMock: CalendarCommitment[] = [
  {
    id: 'c1',
    topicId: 't1',
    title: 'Revisão Álgebra Linear',
    location: 'Sala 1',
    date: baseDate,
    time: '16:00',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'c2',
    topicId: 't2',
    title: 'Leitura: Revolução Francesa',
    location: 'Biblioteca',
    date: baseDate,
    time: '18:30',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'c3',
    topicId: 't3',
    title: 'Exercícios: Estruturas de Dados',
    location: 'Home',
    date: baseDate,
    time: '09:15',
    createdAt: now,
    updatedAt: now,
  },
]
