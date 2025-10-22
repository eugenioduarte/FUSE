import React from 'react'
import { Modal, Text, TouchableOpacity, View } from 'react-native'
import type { ExpandableTerm } from '../../types/domain'

type Props = {
  visible: boolean
  term: ExpandableTerm | null
  onClose: () => void
  onCreateSummary: (term: ExpandableTerm) => void
}

const TermSnippetModal: React.FC<Props> = ({
  visible,
  term,
  onClose,
  onCreateSummary,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#0f1115',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
          }}
        >
          <View style={{ height: 4, alignItems: 'center', marginBottom: 12 }}>
            <View
              style={{
                width: 48,
                height: 4,
                backgroundColor: '#333',
                borderRadius: 2,
              }}
            />
          </View>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
            {term?.term || 'Detalhes'}
          </Text>
          {!!term?.mini && (
            <Text style={{ color: '#cbd5e1', marginTop: 8 }}>{term.mini}</Text>
          )}
          <View style={{ height: 16 }} />
          <TouchableOpacity
            onPress={() => term && onCreateSummary(term)}
            style={{
              backgroundColor: '#3b82f6',
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>
              Criar resumo sobre este tema
            </Text>
          </TouchableOpacity>
          <View style={{ height: 8 }} />
          <TouchableOpacity
            onPress={onClose}
            style={{
              backgroundColor: '#111214',
              borderWidth: 1,
              borderColor: '#2B2C30',
              padding: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#9ca3af', fontWeight: '700' }}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

export default TermSnippetModal
