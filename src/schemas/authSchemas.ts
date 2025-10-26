import { z } from 'zod'
import { t } from '../locales/translation'
// Importe a função de tradução do seu projeto

export const loginSchema = z.object({
  email: z.string().email({ message: t('auth.email_invalid') }),
  password: z.string().min(6, { message: t('auth.password_min') }),
})
