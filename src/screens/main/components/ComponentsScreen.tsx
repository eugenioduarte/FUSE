import Button from '@/components/buttons/button/Button'
import { useTheme } from '@/hooks/useTheme'
import { ThemeType } from '@/types/theme.type'

import React from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'

const ComponentsScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Components (Storybook)</Text>
      <Text style={styles.note}>
        Este é um espaço para demonstrar e testar componentes UI. Adiciona aqui
        os teus exemplos e variações.
      </Text>
      <Button title="Exemplo de Botão" onPress={() => {}} />
    </ScrollView>
  )
}

export default ComponentsScreen

export const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.colors.backgroundPrimary },
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
