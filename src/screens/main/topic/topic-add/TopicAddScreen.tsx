import React, { useState } from 'react'
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { navigatorManager } from '../../../../navigation/navigatorManager'
import { topicsRepository } from '../../../../services/repositories/topics.repository'

const TopicAddScreen: React.FC = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert(
        'Título obrigatório',
        'Por favor, preencha o título do tópico.',
      )
      return
    }
    setSaving(true)
    const now = Date.now()
    const topic = {
      id: `${now}`,
      title: title.trim(),
      description: description.trim() || undefined,
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

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={{
          backgroundColor: saving ? '#3b82f699' : '#3b82f6',
          borderRadius: 10,
          padding: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>
          {saving ? 'A guardar…' : 'Guardar tópico'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default TopicAddScreen
