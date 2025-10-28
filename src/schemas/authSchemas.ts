import { z } from 'zod'
import { t } from '../locales/translation'

export const loginSchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
  password: z.string().min(6, { message: t('auth.password_min') }),
})

export const registerSchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
  password: z.string().min(8, { message: t('auth.password_min8') }),
})

export const recoverySchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
})

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type RecoverySchema = z.infer<typeof recoverySchema>
