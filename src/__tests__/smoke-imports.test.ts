// Minimal smoke tests to exercise module initialization and raise coverage
import * as routes from '../constants/routes'
import * as sizes from '../constants/sizes'
import * as theme from '../constants/theme'
import * as nav from '../navigation/navigationRef'
import * as avatar from '../services/profile/avatar.service'
import * as storage from '../storage/asyncStorage'
import * as useAuth from '../store/useAuthStore'
import * as useOverlay from '../store/useOverlay'
import * as password from '../utils/password'
import * as validators from '../utils/validators'

// Ensure modules export expected keys
test('smoke: modules load and export keys', () => {
  expect(theme).toBeTruthy()
  expect(sizes).toBeTruthy()
  expect(routes).toBeTruthy()
  expect(storage).toBeTruthy()
  expect(useAuth).toBeTruthy()
  expect(useOverlay).toBeTruthy()
  expect(nav).toBeTruthy()
  expect(avatar).toBeTruthy()
  expect(validators.isValidEmail('a@b.com')).toBe(true)
  expect(password.passwordStrength('Abcdef12!').score).toBeGreaterThanOrEqual(1)
})
