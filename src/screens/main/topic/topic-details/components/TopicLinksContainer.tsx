import {
  ChatIcon,
  DeleteIcon,
  EditIcon,
  RankingIcon,
  ShareIcon,
} from '@/assets/icons'
import IconButton from '@/components/buttons/IconButton'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useOverlay } from '@/store/useOverlay'
import { Topic } from '@/types/domain'
import { ThemeType } from '@/types/theme.type'
import { reportError } from '@/utils/errorLogger'
import React from 'react'
import { StyleSheet, View } from 'react-native'

type TopicLinksContainerProps = {
  topicId: string
  topic: Topic
  myUid: string | null | undefined
  connections: {
    uid: string
    name: string | null
    email: string | null
    avatarUrl: string | null
  }[]
  setConnections: React.Dispatch<
    React.SetStateAction<
      {
        uid: string
        name: string | null
        email: string | null
        avatarUrl: string | null
      }[]
    >
  >

  setEditOverlay: (payload: any) => void
  setTopic: React.Dispatch<React.SetStateAction<Topic | null>>
  listAcceptedConnections: (myUid: string) => Promise<
    {
      uid: string
      name: string | null
      email: string | null
      avatarUrl: string | null
    }[]
  >
}

const ICON_SIZE = 20

const TopicLinksContainer = ({
  topicId,
  topic,
  myUid,
  connections,
  setConnections,
  setEditOverlay,
  setTopic,
  listAcceptedConnections,
}: TopicLinksContainerProps) => {
  const theme = useTheme()
  const styles = createStyles(theme)

  const handleEditTopic = () => {
    setEditOverlay({
      type: 'topic',
      topic,
      onSaved: () => {
        topicsRepository.getById(topicId).then((updated) => setTopic(updated))
      },
    })
  }

  const shareTopic = () => {
    if (!myUid) return
    void (async () => {
      try {
        let list = connections
        if (!list || list.length === 0) {
          list = await listAcceptedConnections(myUid)
          setConnections(
            list.map((u) => ({
              uid: u.uid,
              name: u.name,
              email: u.email,
              avatarUrl: u.avatarUrl,
            })),
          )
        }

        try {
          const { setShareOverlay } = useOverlay.getState()
          if (typeof setShareOverlay === 'function') {
            setShareOverlay({
              id: `share-topic-${topicId}`,
              topicId,
              connections: list,
            })
          }
        } catch (err) {
          reportError(err, {
            message: t('common.error'),
            context: { flow: 'share.openOverlay', topicId },
          })
        }
      } catch (err) {
        reportError(err, {
          message: t('common.error'),
          context: { flow: 'share.fetchConnections', topicId },
        })
      }
    })()
  }

  const handleRanking = () => {
    try {
      const { setRankingOverlay } = useOverlay.getState()
      setRankingOverlay({ id: `ranking-${topicId}`, topicId })
    } catch (err) {
      reportError(err, {
        message: t('common.error'),
        context: { flow: 'ranking.open', topicId },
      })
      navigatorManager.goToTopicRanking(topicId)
    }
  }

  const handleChat = () => {
    navigatorManager.goToTopicChat(topicId)
  }

  const handleDelete = () => {
    const { setNotificationOverlay } = useOverlay.getState()
    setNotificationOverlay({
      id: `delete-topic-${topicId}`,
      title: t('topicDetails.delete.confirm_title'),
      body: t('topicDetails.delete.confirm_body'),
      requireDecision: true,
      acceptLabel: t('topicDetails.delete.accept'),
      denyLabel: t('topicDetails.delete.cancel'),
      onAccept: () => {
        ;(async () => {
          try {
            await topicsRepository.deleteById(topicId)
            navigatorManager.goBack()
          } catch (err) {
            reportError(err, {
              message: t('topicDetails.delete.error'),
              context: { flow: 'delete', topicId },
            })
            setNotificationOverlay({
              id: `delete-topic-error-${topicId}`,
              title: t('common.error'),
              body: t('topicDetails.delete.error'),
              requireDecision: false,
            })
          }
        })()
      },
    })
  }

  return (
    <View style={styles.headerRow}>
      <IconButton
        icon={<EditIcon width={ICON_SIZE} height={ICON_SIZE} />}
        onPress={handleEditTopic}
      />
      <IconButton
        icon={<ShareIcon width={ICON_SIZE} height={ICON_SIZE} />}
        onPress={shareTopic}
      />

      {(topic.members?.length ?? 0) > 1 && (
        <IconButton
          icon={<RankingIcon width={ICON_SIZE} height={ICON_SIZE} />}
          onPress={handleRanking}
        />
      )}

      {(() => {
        const membersCount = topic.members?.length ?? 0
        const isMember =
          !!myUid &&
          ((topic.members || []).includes(myUid) || topic.createdBy === myUid)
        if (membersCount >= 2 && isMember) {
          return (
            <IconButton
              icon={<ChatIcon width={ICON_SIZE} height={ICON_SIZE} />}
              onPress={handleChat}
            />
          )
        }
        return null
      })()}
      <IconButton
        icon={<DeleteIcon width={ICON_SIZE} height={ICON_SIZE} />}
        onPress={handleDelete}
      />
    </View>
  )
}

export default TopicLinksContainer

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacings.small,
      marginVertical: theme.spacings.small,
    },
  })
