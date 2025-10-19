import { RouteProp, useRoute } from '@react-navigation/native'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { RootStackParamList } from '../../../../navigation/navigatorManager'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Summary } from '../../../../types/domain'

const SummaryScreen = () => {
  const { setErrorOverlay, setLoadingOverlay, setEditOverlay } = useOverlay()
  const route = useRoute<RouteProp<RootStackParamList, 'SummaryScreen'>>()
  const initialTopicId = route.params?.topicId ?? 'topic-1'
  const initialPrompt =
    route.params?.seedPrompt ?? 'geografia historia do brasil'
  const [topicId, setTopicId] = useState<string>(initialTopicId)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Summary | null>(null)

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setLoadingOverlay(true)
      const summary = await summariesRepository.createWithAI(topicId, prompt)
      setTitle(summary.title || '')
      setContent(summary.content)
      setKeywords(summary.keywords || [])
      setLastSaved(summary)
    } catch (e: any) {
      setErrorOverlay(true, e?.message || 'Falha ao gerar resumo')
    } finally {
      setLoading(false)
      setLoadingOverlay(false)
    }
  }

  // createWithAI já realiza o persist e enfileira para sync; sem ação extra aqui

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
          Gerar resumo com ChatGPT
        </Text>
        {!!lastSaved && (
          <TouchableOpacity
            onPress={() =>
              setEditOverlay({
                type: 'summary',
                summary: lastSaved,
                onSaved: (s) => {
                  setLastSaved(s)
                  setTitle(s.title || '')
                  setContent(s.content)
                  setKeywords(s.keywords || [])
                },
              })
            }
          >
            <Text style={{ color: '#60a5fa', fontWeight: '700' }}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={{ height: 12 }} />
      <Text style={{ color: '#bbb', marginBottom: 6 }}>Tópico (id)</Text>
      <TextInput
        value={topicId}
        onChangeText={setTopicId}
        placeholder="topicId"
        placeholderTextColor="#666"
        editable={!route.params?.topicId}
        style={{
          color: 'white',
          borderWidth: 1,
          borderColor: '#333',
          borderRadius: 8,
          padding: 10,
          marginBottom: 10,
          opacity: route.params?.topicId ? 0.6 : 1,
        }}
      />

      <Text style={{ color: '#bbb', marginBottom: 6 }}>Assunto / Prompt</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        onSubmitEditing={handleGenerate}
        placeholder="ex: geografia historia do brasil"
        placeholderTextColor="#666"
        multiline
        style={{
          color: 'white',
          borderWidth: 1,
          borderColor: '#333',
          borderRadius: 8,
          padding: 10,
          minHeight: 80,
        }}
        returnKeyType="send"
      />

      <View style={{ height: 12 }} />
      <TouchableOpacity
        onPress={handleGenerate}
        disabled={loading || !prompt.trim()}
        style={{
          backgroundColor: loading ? '#1e3a8a' : '#3b82f6',
          borderRadius: 8,
          paddingVertical: 12,
          alignItems: 'center',
        }}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: 'white', fontWeight: '700' }}>Gerar</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 16 }} />
      {!!(title || content) && (
        <ScrollView style={{ flex: 1 }}>
          {!!title && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: lastSaved?.backgroundColor || 'transparent',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  color: lastSaved?.backgroundColor ? '#111' : 'white',
                  fontSize: 16,
                  fontWeight: '700',
                }}
              >
                {title}
              </Text>
            </View>
          )}
          <View style={{ height: 8 }} />
          <Text
            style={{
              color: lastSaved?.backgroundColor ? '#222' : '#ddd',
              lineHeight: 20,
            }}
          >
            {content}
          </Text>
          <View style={{ height: 12 }} />
          {!!keywords.length && (
            <View>
              <Text style={{ color: 'white', fontWeight: '700' }}>
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
                {keywords.map((k) => (
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
      )}
    </View>
  )
}

export default SummaryScreen
