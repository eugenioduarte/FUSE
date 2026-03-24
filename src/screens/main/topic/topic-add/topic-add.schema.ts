import { t } from '@/locales/translation'
import { z } from 'zod'

export const topicSchema = z.object({
  title: z.string().nonempty({ message: t('topic.validation.title_required') }),
  description: z.string().optional(),
})

export type TopicSchema = z.infer<typeof topicSchema>
