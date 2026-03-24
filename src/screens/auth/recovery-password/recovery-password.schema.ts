import { t } from '@/locales/translation'
import { z } from 'zod'

export const recoverySchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
})

export type RecoverySchema = z.infer<typeof recoverySchema>
