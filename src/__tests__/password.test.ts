import { passwordStrength } from '../utils/password'

test('password strength basic thresholds', () => {
  expect(passwordStrength('').label).toBe('vazia')
  expect(passwordStrength('abc').label).toBe('fraca')
  const medium = passwordStrength('Abcdef12')
  expect(['média', 'forte', 'muito forte']).toContain(medium.label)
  const strong = passwordStrength('Abcdef12!')
  expect(['forte', 'muito forte']).toContain(strong.label)
  const very = passwordStrength('Abcdef12!VeryLongPass')
  expect(very.label === 'muito forte' || very.label === 'forte').toBe(true)
})
