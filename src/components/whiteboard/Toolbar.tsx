import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useWhiteboardStore } from '../../store/useWhiteboardStore'

const TOOL_SIZE = 36

const Toolbar: React.FC = () => {
  const {
    mode,
    setMode,
    clearAll,
    addEmoji,
    addIcon,
    viewport,
    selectedId,
    elements,
    select,
    bringToFront,
  } = useWhiteboardStore()
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  const toggle = (m: typeof mode) => {
    if (mode === m) setMode('select')
    else setMode(m)
    if (m !== 'emoji') setEmojiPickerOpen(false)
    if (m !== 'icon') setIconPickerOpen(false)
  }

  const confirmClear = () => {
    Alert.alert('Limpar quadro?', 'Esta ação irá apagar todos os elementos.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: () => clearAll() },
    ])
  }

  // Quick add helpers (center of current viewport)
  const centerCanvas = () => ({
    x: (-viewport.translateX + 180) / viewport.scale,
    y: (-viewport.translateY + 240) / viewport.scale,
  })

  return (
    <View
      style={{
        backgroundColor: '#0f172a',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#111827',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ToolButton
          icon="hand-left-outline"
          active={mode === 'select'}
          onPress={() => toggle('select')}
          label="Selecionar"
        />
        <ToolButton
          icon="pencil"
          active={mode === 'draw'}
          onPress={() => toggle('draw')}
          label="Caneta"
        />
        <ToolButton
          icon="text-outline"
          active={mode === 'text'}
          onPress={() => toggle('text')}
          label="Texto"
        />
        <ToolButton
          icon="happy"
          active={mode === 'emoji'}
          onPress={() => {
            toggle('emoji')
            setEmojiPickerOpen((v) => !v)
          }}
          label="Emoji"
        />
        <ToolButton
          icon="shapes"
          active={mode === 'icon'}
          onPress={() => {
            toggle('icon')
            setIconPickerOpen((v) => !v)
          }}
          label="Ícones"
        />
        <View style={{ flex: 1 }} />
        {!!selectedId && (
          <>
            <ContextActions selectedId={selectedId} elements={elements} />
            <View style={{ width: 8 }} />
          </>
        )}
        <ToolButton icon="trash" onPress={confirmClear} label="Limpar" />
      </View>

      {emojiPickerOpen && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {['😀', '🥳', '👍', '🔥', '🎯', '✅', '❗️', '💡'].map((e) => (
            <TouchableOpacity
              key={e}
              onPress={() => {
                const center = centerCanvas()
                const id = addEmoji(e, center)
                select(id)
                bringToFront(id)
                setMode('select')
              }}
              style={{
                backgroundColor: '#111827',
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 20 }}>{e}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {iconPickerOpen && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 8 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {[
            { key: 'arrow', icon: 'arrow-forward', label: 'Seta' },
            { key: 'circle', icon: 'ellipse-outline', label: 'Círculo' },
            { key: 'rect', icon: 'square-outline', label: 'Quadrado' },
          ].map((it) => (
            <TouchableOpacity
              key={it.key}
              onPress={() => {
                const center = centerCanvas()
                const id = addIcon(it.key as any, center)
                select(id)
                bringToFront(id)
                setMode('select')
              }}
              style={{
                backgroundColor: '#111827',
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons name={it.icon as any} size={18} color="#93c5fd" />
              <Text style={{ color: '#cbd5e1', fontSize: 12 }}>{it.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const ToolButton = ({
  icon,
  active,
  onPress,
  label,
}: {
  icon: any
  active?: boolean
  onPress?: () => void
  label?: string
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? '#1e3a8a' : '#0b1220',
        borderWidth: 1,
        borderColor: active ? '#3b82f6' : '#0b1220',
        padding: 8,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <Ionicons
        name={icon}
        size={TOOL_SIZE * 0.5}
        color={active ? '#bfdbfe' : '#93c5fd'}
      />
      {!!label && (
        <Text style={{ color: '#93c5fd', fontSize: 10 }}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

export default Toolbar

const ContextActions = ({
  selectedId,
  elements,
}: {
  selectedId: string
  elements: import('../../types/whiteboard.type').WhiteboardElement[]
}) => {
  const { deleteSelected, duplicateSelected } = useWhiteboardStore()
  const el = elements.find(
    (e: import('../../types/whiteboard.type').WhiteboardElement) =>
      e.id === selectedId,
  )
  if (!el) return null
  const isText = el.type === 'text'
  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      {isText && (
        <ToolButton
          icon="create-outline"
          label="Editar"
          onPress={() => {
            // no-op here: editing inline handled by tap in canvas; we could also trigger via store if extended
            // leaving hook for future
          }}
        />
      )}
      <ToolButton icon="copy" label="Duplicar" onPress={duplicateSelected} />
      <ToolButton
        icon="trash-outline"
        label="Apagar"
        onPress={deleteSelected}
      />
    </View>
  )
}
