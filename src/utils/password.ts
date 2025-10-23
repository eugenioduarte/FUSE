export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4
  label: 'fraca' | 'média' | 'forte' | 'muito forte' | 'vazia'
  color: string
}

export function passwordStrength(pwd: string): PasswordStrength {
  if (!pwd) return { score: 0, label: 'vazia', color: '#B0B0B0' }

  let score = 0 as 0 | 1 | 2 | 3 | 4

  // Criteria
  const lengthOK = pwd.length >= 8
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumber = /\d/.test(pwd)
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd)

  const checks = [lengthOK, hasLower, hasUpper, hasNumber, hasSymbol]
  const raw = checks.reduce((acc, ok) => acc + (ok ? 1 : 0), 0)
  score = Math.min(4, raw) as 0 | 1 | 2 | 3 | 4

  let label: PasswordStrength['label'] = 'fraca'
  let color = '#f25d4c' // warning

  if (score <= 2) {
    label = 'fraca'
    color = '#f25d4c'
  } else if (score === 3) {
    label = 'média'
    color = '#E0A800'
  } else if (score === 4) {
    // strong if all checks passed
    label = 'forte'
    color = '#2E8B57'
  }

  // Bonus for very long passwords
  if (score === 4 && pwd.length >= 14) {
    label = 'muito forte'
    color = '#1F7A1F'
    score = 4
  }

  return { score, label, color }
}
