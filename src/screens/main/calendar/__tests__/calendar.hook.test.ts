import { useCalendarScreen } from '../calendar.hook'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/store/calendar.store', () => ({
  useCalendarStore: (selector: any) =>
    selector({ selectedDate: null, setSelectedDate: jest.fn(), removeAppointment: jest.fn(), events: [] }),
}))
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) => selector({ user: { id: 'user-1' } }),
}))
jest.mock('@/navigation/navigator-manager', () => ({ navigatorManager: { navigate: jest.fn() } }))
jest.mock('@/services/firebase/calendar.service', () => ({
  deleteOwnedCalendarEvent: jest.fn(),
  leaveCalendarEvent: jest.fn(),
}))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { seedIfEmpty: jest.fn().mockResolvedValue(undefined), list: jest.fn().mockResolvedValue([]), listAll: jest.fn().mockResolvedValue([]), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/services/repositories/topics.repository', () => ({
  topicsRepository: { seedIfEmpty: jest.fn().mockResolvedValue(undefined), list: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
}))

describe('useCalendarScreen', () => {
  it('returns currentMonth as a Date', () => {
    const { result } = renderHook(() => useCalendarScreen())
    expect(result.current.currentMonth).toBeInstanceOf(Date)
  })

  it('returns empty events array by default', () => {
    const { result } = renderHook(() => useCalendarScreen())
    expect(result.current.events).toEqual([])
  })

  it('returns navigation handlers', () => {
    const { result } = renderHook(() => useCalendarScreen())
    expect(typeof result.current.goPrevMonth).toBe('function')
    expect(typeof result.current.goNextMonth).toBe('function')
  })
})
