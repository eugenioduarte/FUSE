import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query'
import { aiService } from '../../services/ai/ai.service'
import { getPreferredLanguage } from './lang'

const STALE_TIME = 5 * 60 * 1000 // 5 minutes
const CACHE_TIME = 30 * 60 * 1000 // 30 minutes (v5 uses gcTime; we set cacheTime for clarity)

// --- Queries (automatic) ---
export function useSummaryQuery(
  params: { prompt?: string; lang?: string },
  options?: Omit<
    UseQueryOptions<Awaited<ReturnType<typeof aiService.generateSummary>>>,
    'queryKey' | 'queryFn'
  >,
) {
  const lang = params.lang || getPreferredLanguage()
  const enabled = !!params.prompt && (options?.enabled ?? true)
  return useQuery({
    queryKey: ['ai', 'summary', { prompt: params.prompt, lang }],
    queryFn: () =>
      aiService.generateSummary(`${params.prompt}\n\nIdioma alvo: ${lang}`),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled,
    ...options,
  })
}

export function useKnowledgeSummaryQuery(
  params: { prompt?: string; lang?: string },
  options?: Omit<
    UseQueryOptions<
      Awaited<ReturnType<typeof aiService.generateKnowledgeSummary>>
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const lang = params.lang || getPreferredLanguage()
  const enabled = !!params.prompt && (options?.enabled ?? true)
  return useQuery({
    queryKey: ['ai', 'knowledge', { prompt: params.prompt, lang }],
    queryFn: () =>
      aiService.generateKnowledgeSummary(
        `${params.prompt}\n\nIdioma alvo: ${lang}`,
      ),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled,
    ...options,
  })
}

export function useMiniExplainQuery(
  params: { term?: string; context?: string; lang?: string },
  options?: Omit<UseQueryOptions<string>, 'queryKey' | 'queryFn'>,
) {
  const lang = params.lang || getPreferredLanguage()
  const enabled = !!params.term && (options?.enabled ?? true)
  const keyContext = (params.context || '').slice(0, 200)
  return useQuery({
    queryKey: ['ai', 'mini', { term: params.term, lang, ctx: keyContext }],
    queryFn: () =>
      aiService.miniExplain(
        `${params.term} (responder em ${lang})`,
        params.context,
      ),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    enabled,
    ...options,
  })
}

// --- Mutations (on demand) ---
export function useGenerateSummaryMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof aiService.generateSummary>>,
    unknown,
    { prompt: string; lang?: string }
  >,
) {
  return useMutation({
    mutationKey: ['ai', 'summary:mutate'],
    mutationFn: ({ prompt, lang }) => {
      const target = lang || getPreferredLanguage()
      return aiService.generateSummary(`${prompt}\n\nIdioma alvo: ${target}`)
    },
    ...options,
  })
}

export function useGenerateKnowledgeSummaryMutation(
  options?: UseMutationOptions<
    Awaited<ReturnType<typeof aiService.generateKnowledgeSummary>>,
    unknown,
    { prompt: string; lang?: string }
  >,
) {
  return useMutation({
    mutationKey: ['ai', 'knowledge:mutate'],
    mutationFn: ({ prompt, lang }) => {
      const target = lang || getPreferredLanguage()
      return aiService.generateKnowledgeSummary(
        `${prompt}\n\nIdioma alvo: ${target}`,
      )
    },
    ...options,
  })
}

export function useMiniExplainMutation(
  options?: UseMutationOptions<
    string,
    unknown,
    { term: string; context?: string; lang?: string }
  >,
) {
  return useMutation({
    mutationKey: ['ai', 'mini:mutate'],
    mutationFn: ({ term, context, lang }) => {
      const target = lang || getPreferredLanguage()
      return aiService.miniExplain(`${term} (responder em ${target})`, context)
    },
    ...options,
  })
}
