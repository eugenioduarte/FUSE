import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Summary } from '../../../../types/domain'

const SummaryDetailsScreen: React.FC = () => {
  const route =
    useRoute<RouteProp<RootStackParamList, 'SummaryDetailsScreen'>>()
  const { summaryId } = route.params
  const { setEditOverlay } = useOverlay()
  const [summary, setSummary] = useState<Summary | null>(
    route.params.summary ?? null,
  )
  const [loading, setLoading] = useState(!route.params.summary)

  useEffect(() => {
    let active = true
    ;(async () => {
      // If we already have the summary from params, skip fetch
      if (summary) {
        setLoading(false)
        return
      }
      const found = await summariesRepository.getById(summaryId)
      if (!active) return
      setSummary(found)
      setLoading(false)
    })()
    return () => {
      active = false
    }
  }, [summaryId, summary])

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!summary) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
            Resumo
          </Text>
          {/* If needed, the edit overlay could be invoked with a placeholder; but we need the summary data.
              For now, hide Edit if we couldn't resolve the summary. */}
        </View>
        <Text style={{ color: '#bbb', marginTop: 8 }}>
          Resumo não encontrado.
        </Text>
        <Text style={{ color: '#bbb', marginTop: 4 }}>ID: {summaryId}</Text>
      </View>
    )
  }

  const colored = !!summary.backgroundColor
  const bg = summary.backgroundColor || '#0b0b0c'
  const titleColor = colored ? '#111' : 'white'
  const bodyColor = colored ? '#222' : '#ddd'

  return (
    <View style={{ flex: 1, backgroundColor: bg, padding: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: titleColor, fontSize: 18, fontWeight: '700' }}>
          {summary.title || 'Resumo'}
        </Text>
        <TouchableOpacity
          onPress={() =>
            setEditOverlay({
              type: 'summary',
              summary,
              onSaved: (s) => setSummary(s),
            })
          }
        >
          <Text style={{ color: '#60a5fa', fontWeight: '700' }}>Editar</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 12 }} />
      <ScrollView>
        <Text style={{ color: bodyColor, lineHeight: 20 }}>
          {summary.content}
        </Text>
        {!!summary.keywords?.length && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: titleColor, fontWeight: '700' }}>
              Palavras-chave
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                marginTop: 8,
              }}
            >
              {summary.keywords.map((k) => (
                <View
                  key={k}
                  style={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderWidth: 1,
                    borderRadius: 999,
                    paddingVertical: 6,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ color: '#9ca3af' }}>{k}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      <View style={{ height: 12 }} />
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <TouchableOpacity
          onPress={() => navigatorManager.goToChallengeAdd({ summaryId })}
          style={{
            backgroundColor: '#3b82f6',
            borderRadius: 10,
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>
            Criar challenge
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default SummaryDetailsScreen
