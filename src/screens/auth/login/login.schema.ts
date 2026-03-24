import { t } from '@/locales/translation'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
  password: z.string().min(6, { message: t('auth.password_min') }),
})

export type LoginSchema = z.infer<typeof loginSchema>
