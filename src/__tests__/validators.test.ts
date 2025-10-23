import { isValidEmail } from '../utils/validators'

test('validates email format', () => {
  expect(isValidEmail('user@example.com')).toBe(true)
  expect(isValidEmail('USER+tag@sub.domain.io')).toBe(true)
  expect(isValidEmail('bad@domain')).toBe(false)
  expect(isValidEmail('not-an-email')).toBe(false)
})
