import { startSession, stopSessionByKey } from '@/services/usage/usage-tracker'
import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'

type Scope = 'summary' | 'challenge' | 'summary_list' | 'challenge_list'

export default function useTrackTopicSession(
  topicId?: string | null,
  scope?: Scope,
  id?: string,
) {
  useFocusEffect(
    useCallback(() => {
      let sessionKey: string | null = null
      ;(async () => {
        try {
          if (!topicId || !scope) return
          sessionKey = await startSession(topicId, scope, id)
        } catch {}
      })()

      return () => {
        if (sessionKey) stopSessionByKey(sessionKey)
      }
    }, [topicId, scope, id]),
  )
}
