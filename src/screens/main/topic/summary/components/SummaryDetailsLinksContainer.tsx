import { DeleteIcon, DownloadIcon, QuizIcon } from '@/assets/icons'
import IconButton from '@/components/buttons/icon-button/IconButton'
import { useTheme } from '@/hooks/useTheme'
import { navigatorManager } from '@/navigation/navigatorManager'
import { Summary } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { StyleSheet, View } from 'react-native'

const ICON_SIZE = 20

type SummaryDetailsLinksContainerProps = {
  summary: Summary
  handleDeleteSummary: (onSuccess: () => void) => void
  handleDownload: () => void
}

const SummaryDetailsLinksContainer = ({
  summary,
  handleDeleteSummary,
  handleDownload,
}: SummaryDetailsLinksContainerProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const id = summary.id

  return (
    <View style={styles.row}>
      <View style={styles.subRow}>
        <IconButton
          icon={<QuizIcon width={ICON_SIZE} height={ICON_SIZE} />}
          onPress={() => navigatorManager.goToChallengesList({ summaryId: id })}
        />
        <IconButton
          icon={<DownloadIcon width={ICON_SIZE} height={ICON_SIZE} />}
          onPress={() => handleDownload()}
        />
      </View>

      <IconButton
        icon={<DeleteIcon width={ICON_SIZE} height={ICON_SIZE} />}
        onPress={() => handleDeleteSummary(() => navigatorManager.goBack())}
      />
    </View>
  )
}

export default React.memo(SummaryDetailsLinksContainer)

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: theme.spacings.small,
      gap: theme.spacings.small,
      width: '100%',
    },
    subRow: { flexDirection: 'row', gap: theme.spacings.small },
  })
