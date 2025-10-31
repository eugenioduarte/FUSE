import { z } from 'zod'
import { t } from '../locales/translation'

export const topicSchema = z.object({
  title: z.string().nonempty({ message: t('topic.validation.title_required') }),
  description: z.string().optional(),
  backgroundColor: z
    .string()
    .nonempty({ message: t('topic.validation.color_required') }),
})

export type TopicSchema = z.infer<typeof topicSchema>
