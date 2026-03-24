import { useCalendarStore } from '../calendar.store'

const initialState = useCalendarStore.getState()

beforeEach(() => {
  useCalendarStore.setState({ ...initialState, events: [], selectedDate: null })
})

const makeEvent = (overrides = {}) => ({
  id: 'evt-1',
  topicId: 'topic-1',
  title: 'Test Event',
  description: 'desc',
  date: '2026-03-24',
  time: '10:00',
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
})

describe('useCalendarStore', () => {
  describe('setSelectedDate', () => {
    it('updates selectedDate', () => {
      useCalendarStore.getState().setSelectedDate('2026-03-24')
      expect(useCalendarStore.getState().selectedDate).toBe('2026-03-24')
    })
  })

  describe('addOrUpdate', () => {
    it('adds a new event', () => {
      useCalendarStore.getState().addOrUpdate(makeEvent())
      expect(useCalendarStore.getState().events).toHaveLength(1)
    })

    it('updates an existing event by id', () => {
      useCalendarStore.getState().addOrUpdate(makeEvent())
      useCalendarStore.getState().addOrUpdate(makeEvent({ title: 'Updated' }))
      const events = useCalendarStore.getState().events
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('Updated')
    })

    it('prepends when adding a new distinct event', () => {
      useCalendarStore.getState().addOrUpdate(makeEvent({ id: 'a' }))
      useCalendarStore.getState().addOrUpdate(makeEvent({ id: 'b' }))
      expect(useCalendarStore.getState().events[0].id).toBe('b')
    })
  })

  describe('getEventsForDate', () => {
    it('returns only events matching the given date', () => {
      useCalendarStore
        .getState()
        .addOrUpdate(makeEvent({ date: '2026-03-24', id: 'a' }))
      useCalendarStore
        .getState()
        .addOrUpdate(makeEvent({ date: '2026-03-25', id: 'b' }))
      const events = useCalendarStore.getState().getEventsForDate('2026-03-24')
      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('a')
    })

    it('returns empty array when no events match', () => {
      expect(
        useCalendarStore.getState().getEventsForDate('2099-01-01'),
      ).toEqual([])
    })
  })

  describe('seedIfEmpty', () => {
    it('is a no-op and leaves events empty', async () => {
      await useCalendarStore.getState().seedIfEmpty()
      expect(useCalendarStore.getState().events).toHaveLength(0)
    })

    it('does not overwrite existing events', async () => {
      useCalendarStore.getState().addOrUpdate(makeEvent())
      await useCalendarStore.getState().seedIfEmpty()
      expect(useCalendarStore.getState().events).toHaveLength(1)
    })
  })

  describe('addAppointment', () => {
    it('creates an event with generated id and default time', () => {
      useCalendarStore.getState().addAppointment({
        title: 'New Appt',
        description: 'desc',
        date: '2026-03-24',
      })
      const { events } = useCalendarStore.getState()
      expect(events).toHaveLength(1)
      expect(events[0].title).toBe('New Appt')
      expect(events[0].time).toBe('00:00')
      expect(events[0].id).toBeTruthy()
    })

    it('uses provided time when given', () => {
      useCalendarStore.getState().addAppointment({
        title: 'Morning',
        description: '',
        date: '2026-03-24',
        time: '08:00',
      })
      expect(useCalendarStore.getState().events[0].time).toBe('08:00')
    })
  })

  describe('editAppointment', () => {
    it('updates fields on an existing event', () => {
      useCalendarStore.setState({ events: [makeEvent()] })
      useCalendarStore.getState().editAppointment('evt-1', { title: 'Edited' })
      expect(useCalendarStore.getState().events[0].title).toBe('Edited')
    })

    it('does not affect other events', () => {
      useCalendarStore.setState({
        events: [
          makeEvent({ id: 'a' }),
          makeEvent({ id: 'b', title: 'Other' }),
        ],
      })
      useCalendarStore.getState().editAppointment('a', { title: 'Changed' })
      const events = useCalendarStore.getState().events
      expect(events.find((e) => e.id === 'b')?.title).toBe('Other')
    })
  })

  describe('removeAppointment', () => {
    it('removes the event with the given id', () => {
      useCalendarStore.setState({ events: [makeEvent()] })
      useCalendarStore.getState().removeAppointment('evt-1')
      expect(useCalendarStore.getState().events).toHaveLength(0)
    })

    it('does not remove other events', () => {
      useCalendarStore.setState({
        events: [makeEvent({ id: 'a' }), makeEvent({ id: 'b' })],
      })
      useCalendarStore.getState().removeAppointment('a')
      expect(useCalendarStore.getState().events[0].id).toBe('b')
    })
  })
})
