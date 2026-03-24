import { CloseIcon } from '@/assets/icons'
import { Button, IconButton, Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { useThemeStore } from '@/store/theme.store'
import type { ExpandableTerm } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import { DEFAULT_ICON_SIZE } from '@expo/vector-icons/build/createIconSet'
import React from 'react'
import { Modal, StyleSheet, View } from 'react-native'

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
  const theme = useTheme()
  const styles = createStyles(theme)
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <IconButton
            icon={
              <CloseIcon width={DEFAULT_ICON_SIZE} height={DEFAULT_ICON_SIZE} />
            }
            onPress={onClose}
            styles={styles.closeButton}
          />
          <Text variant="xLarge">{t('termSnippet.title')}</Text>
          {!!term?.mini && (
            <Text variant={'large'} style={styles.miniText}>
              {term.mini} {t('termSnippet.mini_suffix')}
            </Text>
          )}
          <View style={styles.spacer} />

          <Button
            title={t('termSnippet.create_button')}
            onPress={() => term && onCreateSummary(term)}
            background={color}
            style={styles.createButton}
          />
        </View>
      </View>
    </Modal>
  )
}

export default TermSnippetModal

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.backgroundPrimary,
      borderTopLeftRadius: theme.border.radius16,
      borderTopRightRadius: theme.border.radius16,
      padding: theme.spacings.medium,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      overflow: 'hidden',
    },
    closeButton: {
      alignSelf: 'flex-end',
    },
    miniText: {
      marginTop: theme.spacings.small,
    },
    spacer: {
      height: theme.spacings.medium,
    },
    createButton: {
      alignSelf: 'center',
      marginVertical: theme.spacings.medium,
    },
  })
