/** Mock for useAuthStore — use in tests that need authenticated user state */
export const authStoreMock = {
  user: {
    id: 'user-123',
    displayName: 'Test User',
    email: 'test@example.com',
  },
  rehydrated: true,
  hasShownOnboarding: true,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  setHasShownOnboarding: jest.fn(),
}

/** Auth store mock for unauthenticated state */
export const unauthenticatedAuthStoreMock = {
  user: null,
  rehydrated: true,
  hasShownOnboarding: false,
  login: jest.fn(),
  logout: jest.fn(),
  updateUser: jest.fn(),
  setHasShownOnboarding: jest.fn(),
}

/** Mock for useOverlay — use in tests that trigger overlays */
export const overlayStoreMock = {
  loadingOverlay: false,
  errorOverlay: false,
  fastWayOverlay: false,
  editOverlay: false,
  setLoadingOverlay: jest.fn(),
  setErrorOverlay: jest.fn(),
  setFastWayOverlay: jest.fn(),
  setEditOverlay: jest.fn(),
  setNotificationOverlay: jest.fn(),
  setRankingOverlay: jest.fn(),
  setSuccessOverlay: jest.fn(),
  clearOverlay: jest.fn(),
}

/** Mock for useThemeStore */
export const themeStoreMock = {
  backgroundColor: '#000000',
  levelTenColor: '#ffffff',
  headerConfig: null,
  setBackgroundColor: jest.fn(),
  setLevelTenColor: jest.fn(),
  setHeaderConfig: jest.fn(),
}
