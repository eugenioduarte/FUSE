import { t } from '@/locales/translation'
import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
  password: z.string().min(8, { message: t('auth.password_min8') }),
})

export type RegisterSchema = z.infer<typeof registerSchema>
