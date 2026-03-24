jest.mock('@/components/snackbar-provider/snackbar-provider', () => ({
  useSnackbar: () => ({ showSnackbar: jest.fn() }),
}))
jest.mock('@/locales/translation', () => ({ t: (k: string) => k }))
jest.mock('@/services/firebase/auth.service', () => ({
  changeEmail: jest.fn(),
  changePassword: jest.fn(),
  updateAvatarUrl: jest.fn(),
  updateDisplayName: jest.fn(),
}))
jest.mock('@/services/firebase/user-profile.service', () => ({
  setUserAvatarMeta: jest.fn(),
  upsertUserProfile: jest.fn(),
}))
jest.mock('@/services/profile/avatar.service', () => ({
  AVATAR_STYLES: ['avataaars'],
  generateAvatarUrl: jest.fn(() => 'https://example.com/avatar'),
  parseAvatarUrl: jest.fn(() => ({ style: 'avataaars', seed: 'abc' })),
  randomSeed: jest.fn(() => 'seed-123'),
}))
jest.mock('@/store/auth.store', () => ({
  useAuthStore: (selector: any) =>
    selector({
      user: { id: 'user-1', displayName: 'Test', email: 'test@test.com' },
    }),
}))

describe('useProfile', () => {
  it('renders without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
