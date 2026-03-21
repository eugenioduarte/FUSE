jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: jest.fn().mockReturnValue({
    isReady: jest.fn().mockReturnValue(false),
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    getCurrentRoute: jest.fn().mockReturnValue(undefined),
  }),
}))

describe('navigationRef', () => {
  it('creates a navigation container ref', () => {
    const { navigationRef } = require('../navigationRef')
    expect(navigationRef).toBeDefined()
  })

  it('exposes isReady method', () => {
    const { navigationRef } = require('../navigationRef')
    expect(typeof navigationRef.isReady).toBe('function')
  })

  it('exposes navigate method', () => {
    const { navigationRef } = require('../navigationRef')
    expect(typeof navigationRef.navigate).toBe('function')
  })

  it('exposes goBack method', () => {
    const { navigationRef } = require('../navigationRef')
    expect(typeof navigationRef.goBack).toBe('function')
  })
})
