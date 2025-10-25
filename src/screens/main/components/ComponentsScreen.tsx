import React from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

const ComponentsScreen: React.FC = () => {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Components (Storybook)</Text>
      <Text style={styles.note}>
        Este é um espaço para demonstrar e testar componentes UI. Adiciona aqui
        os teus exemplos e variações.
      </Text>
      {/* Placeholder showcase area; add real examples as they are created */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exemplo de componente</Text>
        <Text style={styles.cardText}>Coloca um componente aqui…</Text>
      </View>
    </ScrollView>
  )
}

export default ComponentsScreen

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#111' },
  content: { padding: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  note: { color: '#ddd', marginBottom: 16 },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  cardTitle: { color: '#fff', fontWeight: '700', marginBottom: 6 },
  cardText: { color: '#ddd' },
})
