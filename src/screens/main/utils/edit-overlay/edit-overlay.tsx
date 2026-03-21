import { Button, Text, TextInput } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { summariesRepository } from '@/services/repositories/summaries.repository'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import { useThemeStore } from '@/store/useThemeStore'
import { Summary, Topic } from '@/types/domain'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import OverlayContainer from '../components/overlay-container'

const EditOverlay: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

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

  return (
    <Modal visible={visible} transparent animationType="slide">
      <OverlayContainer>
        <View style={styles.headerRow}>
          <Text variant="xLarge">
            {isTopic
              ? t('editOverlay.title.topic')
              : t('editOverlay.title.summary')}
          </Text>

          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <Text variant="large" style={styles.fieldLabel}>
          {t('editOverlay.field.title')}
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={
            isTopic
              ? t('editOverlay.field.title_placeholder.topic')
              : t('editOverlay.field.title_placeholder.summary')
          }
          style={styles.input}
        />

        <Text variant="large" style={styles.descLabel}>
          {t('editOverlay.field.description')}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder={t('editOverlay.field.description_placeholder')}
          multiline
          numberOfLines={4}
          style={styles.textarea}
        />

        <Button
          title={
            saving
              ? t('editOverlay.button.saving')
              : t('editOverlay.button.save')
          }
          onPress={onSave}
          disabled={saving}
          background={theme.colors.backgroundTertiary}
          style={styles.centeredButton}
        />
      </OverlayContainer>
    </Modal>
  )
}

export default EditOverlay

const createStyles = (theme: any, color?: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
      paddingTop: 0,
    },
    list: { width: '100%', paddingTop: theme.spacings.medium },
    contentContainer: { paddingBottom: 100 },
    emptyContainer: { padding: theme.spacings.medium },
    emptyText: { color: theme.colors.textPrimary },
    button: {
      alignSelf: 'center',
      position: 'absolute',
      bottom: theme.spacings.large,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fieldLabel: { marginTop: 16, marginBottom: 8 },
    input: {
      borderColor: theme.colors.borderColor,
      borderWidth: 2,
      backgroundColor: color,
    },
    descLabel: { marginBottom: 6 },
    textarea: { backgroundColor: color, height: 100, textAlignVertical: 'top' },
    centeredButton: { marginTop: 16, alignSelf: 'center' },
  })
