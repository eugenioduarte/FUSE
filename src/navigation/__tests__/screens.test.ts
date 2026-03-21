import { NavigationScreenName } from '../screens'

describe('NavigationScreenName', () => {
  it('LoginScreen maps to the correct string value', () => {
    expect(NavigationScreenName.LoginScreen).toBe('LoginScreen')
  })

  it('Dashboard maps to the correct string value', () => {
    expect(NavigationScreenName.Dashboard).toBe('Dashboard')
  })

  it('all enum values are non-empty strings', () => {
    Object.values(NavigationScreenName).forEach((value) => {
      expect(typeof value).toBe('string')
      expect(value.length).toBeGreaterThan(0)
    })
  })

  it('enum has all expected screen definitions', () => {
    const expected = [
      'LoginScreen',
      'CalendarScreen',
      'ChallengeAddScreen',
      'TopicDetailsScreen',
      'SummaryScreen',
      'ProfileScreen',
    ]
    expected.forEach((screen) => {
      const values = Object.values(NavigationScreenName)
      expect(values).toContain(screen)
    })
  })
})
