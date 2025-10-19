import React, { useMemo, useState } from 'react'
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '../../../../constants/theme'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { useOverlay } from '../../../../store/useOverlay'
import { Summary, Topic } from '../../../../types/domain'

const colorEntries = Object.entries(Colors.backgroundTextColors)

const EditOverlay: React.FC = () => {
  const { editOverlay, setEditOverlay } = useOverlay()
  const visible = !!editOverlay

  const isTopic = editOverlay?.type === 'topic'
  const initialTopic = (
    isTopic ? (editOverlay as any).topic : null
  ) as Topic | null
  const initialSummary = (
    isTopic ? null : (editOverlay as any)?.summary
  ) as Summary | null

  const [title, setTitle] = useState<string>(
    initialTopic?.title || initialSummary?.title || '',
  )
  const [description, setDescription] = useState<string>(
    initialTopic?.description || '',
  )
  const [content, setContent] = useState<string>(initialSummary?.content || '')
  const [keywordsText, setKeywordsText] = useState<string>(
    (initialSummary?.keywords || []).join(', '),
  )
  const [backgroundColor, setBackgroundColor] = useState<string>(
    initialTopic?.backgroundColor || initialSummary?.backgroundColor || '',
  )
  const [saving, setSaving] = useState(false)

  React.useEffect(() => {
    // Reset fields when opening with a different entity
    setTitle(initialTopic?.title || initialSummary?.title || '')
    setDescription(initialTopic?.description || '')
    setContent(initialSummary?.content || '')
    setKeywordsText((initialSummary?.keywords || []).join(', '))
    setBackgroundColor(
      initialTopic?.backgroundColor || initialSummary?.backgroundColor || '',
    )
  }, [
    initialTopic?.id,
    initialTopic?.title,
    initialTopic?.description,
    initialTopic?.backgroundColor,
    initialSummary?.id,
    initialSummary?.title,
    initialSummary?.content,
    initialSummary?.keywords,
    initialSummary?.backgroundColor,
  ])

  const onClose = () => setEditOverlay(null)

  const onSave = async () => {
    if (!editOverlay) return
    setSaving(true)
    try {
      if (isTopic && initialTopic) {
        const updated: Topic = {
          ...initialTopic,
          title: title.trim() || initialTopic.title,
          description: description.trim() || undefined,
          backgroundColor: backgroundColor || undefined,
          updatedAt: Date.now(),
        }
        await topicsRepository.upsert(updated, '/sync/topic')
        ;(editOverlay as { onSaved?: (t: Topic) => void }).onSaved?.(updated)
      } else if (initialSummary) {
        const updated: Summary = {
          ...initialSummary,
          title: title.trim() || undefined,
          content: content,
          keywords: keywordsText
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          backgroundColor: backgroundColor || undefined,
          updatedAt: Date.now(),
        }
        await summariesRepository.upsert(updated, '/sync/summary')
        ;(editOverlay as { onSaved?: (s: Summary) => void }).onSaved?.(updated)
      }
      setEditOverlay(null)
    } catch {
      // Silent; could route to error overlay if desired
    } finally {
      setSaving(false)
    }
  }

  const ColorSelector = useMemo(() => {
    return (
      <View style={{ marginTop: 8 }}>
        <Text style={{ color: '#bbb', marginBottom: 6 }}>Cor de fundo</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{}}
          contentContainerStyle={{ gap: 8 }}
        >
          {colorEntries.map(([name, color]) => {
            const selected = backgroundColor === color
            return (
              <TouchableOpacity
                key={name}
                onPress={() => setBackgroundColor(color)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: color,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? '#3b82f6' : '#2f2f31',
                }}
              >
                <Text style={{ color: '#111', fontWeight: '700' }}>{name}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    )
  }, [backgroundColor])

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          padding: 20,
          justifyContent: 'center',
        }}
      >
        <View
          style={{ backgroundColor: '#0b0b0c', borderRadius: 12, padding: 16 }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
              {isTopic ? 'Editar tópico' : 'Editar resumo'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: '#60a5fa', fontWeight: '700' }}>
                Fechar
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 12 }} />
          <Text style={{ color: '#bbb', marginBottom: 6 }}>Título</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={isTopic ? 'Título do tópico' : 'Título do resumo'}
            placeholderTextColor="#666"
            style={{
              backgroundColor: '#1c1c1e',
              color: 'white',
              borderRadius: 8,
              padding: 12,
              borderColor: '#2f2f31',
              borderWidth: 1,
              marginBottom: 12,
            }}
          />

          {isTopic ? (
            <>
              <Text style={{ color: '#bbb', marginBottom: 6 }}>Descrição</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Breve descrição"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                style={{
                  backgroundColor: '#1c1c1e',
                  color: 'white',
                  borderRadius: 8,
                  padding: 12,
                  borderColor: '#2f2f31',
                  borderWidth: 1,
                  marginBottom: 12,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
              />
              {ColorSelector}
            </>
          ) : (
            <>
              <Text style={{ color: '#bbb', marginBottom: 6 }}>Conteúdo</Text>
              <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Conteúdo do resumo"
                placeholderTextColor="#666"
                multiline
                numberOfLines={8}
                style={{
                  backgroundColor: '#1c1c1e',
                  color: 'white',
                  borderRadius: 8,
                  padding: 12,
                  borderColor: '#2f2f31',
                  borderWidth: 1,
                  marginBottom: 12,
                  minHeight: 140,
                  textAlignVertical: 'top',
                }}
              />
              <Text style={{ color: '#bbb', marginBottom: 6 }}>
                Palavras-chave (separadas por vírgula)
              </Text>
              <TextInput
                value={keywordsText}
                onChangeText={setKeywordsText}
                placeholder="ex: brasil, história, geografia"
                placeholderTextColor="#666"
                style={{
                  backgroundColor: '#1c1c1e',
                  color: 'white',
                  borderRadius: 8,
                  padding: 12,
                  borderColor: '#2f2f31',
                  borderWidth: 1,
                  marginBottom: 12,
                }}
              />
              {ColorSelector}
            </>
          )}

          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            style={{
              backgroundColor: saving ? '#3b82f699' : '#3b82f6',
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {saving ? 'A guardar…' : 'Guardar alterações'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default EditOverlay
