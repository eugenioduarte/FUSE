import React, { useMemo, useState } from 'react'
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors } from '../../../../constants/theme'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { topicsRepository } from '../../../../services/repositories/topics.repository'

const TopicAddScreen: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [backgroundColor, setBackgroundColor] = useState<string | undefined>()

  const colorEntries = useMemo(
    () => Object.entries(Colors.backgroundTextColors),
    [],
  )

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Título obrigatório',
        'Por favor, preencha o título do tópico.',
      )
      return
    }
    if (!backgroundColor) {
      Alert.alert(
        'Cor obrigatória',
        'Selecione uma cor de fundo para o tópico.',
      )
      return
    }
    setSaving(true)
    const now = Date.now()
    const topic = {
      id: `${now}`,
      title: title.trim(),
      description: description.trim() || undefined,
      backgroundColor: backgroundColor || undefined,
      createdAt: now,
      updatedAt: now,
    }
    try {
      await topicsRepository.upsert(topic as any, '/sync/topic')
      navigatorManager.goBack()
    } catch {
      console.warn('Falha ao guardar tópico')
      Alert.alert('Erro', 'Não foi possível salvar o tópico. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0b0b0c', padding: 16 }}>
      <Text
        style={{
          color: 'white',
          fontSize: 18,
          fontWeight: '700',
          marginBottom: 12,
        }}
      >
        Novo tópico
      </Text>
      <Text style={{ color: '#bbb', marginBottom: 6 }}>Título</Text>
      <TextInput
        placeholder="Ex: Algoritmos"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
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

      <Text style={{ color: '#bbb', marginBottom: 6 }}>
        Descrição (opcional)
      </Text>
      <TextInput
        placeholder="Breve descrição"
        placeholderTextColor="#666"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={{
          backgroundColor: '#1c1c1e',
          color: 'white',
          borderRadius: 8,
          padding: 12,
          borderColor: '#2f2f31',
          borderWidth: 1,
          marginBottom: 16,
          minHeight: 100,
          textAlignVertical: 'top',
        }}
      />

      {/* Color selector */}
      <Text style={{ color: '#bbb', marginBottom: 6 }}>Cor de fundo</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 8 }}
        style={{ marginBottom: 12 }}
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

      {(() => {
        const canSave = !!title.trim() && !!backgroundColor
        const bg = canSave ? (saving ? '#3b82f699' : '#3b82f6') : '#1f2937'
        return (
          <TouchableOpacity
            onPress={onSave}
            disabled={saving || !canSave}
            style={{
              backgroundColor: bg,
              borderRadius: 10,
              padding: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              {saving ? 'A guardar…' : 'Guardar tópico'}
            </Text>
          </TouchableOpacity>
        )
      })()}
    </View>
  )
}

export default TopicAddScreen
