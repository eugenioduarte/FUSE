import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ThemeType } from '@/types/theme.type'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Text } from '../../../../components'
import { type AppNotification } from '../../../../services/firebase/notifications.service'
import { useCalendarStore } from '../../../../store/useCalendarStore'

const IMAGE_SIZE = 60
const IMAGE_PLACEHOLDER = 'https://picsum.photos/200/300'

export default function DashboardNotificationDisplay() {
  const theme = useTheme()
  const styles = createStyles(theme)

  useEffect(() => {
    try {
      useCalendarStore.getState().seedIfEmpty()
    } catch {}
  }, [])
  // Temporary mock notifications for visual verification. Do NOT enable
  // live subscription while we're validating the UI.
  const MOCK_NOTIFS: AppNotification[] = [
    {
      id: 'm1',
      title: 'Bem-vindo ao Fuse!',
      body: 'Veja seus tópicos e comece a estudar.',
      status: 'pending',
      createdAt: Date.now(),
    },
    {
      id: 'm2',
      title: 'Novo convite de calendário',
      body: 'Você foi convidado para um estudo em grupo.',
      status: 'pending',
      createdAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'm3',
      title: 'Resumo publicado',
      body: 'Um novo resumo foi adicionado ao seu tópico favorito.',
      status: 'pending',
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
    },
  ]

  // Keep mocked notifications only for the UI preview. No live subscription.
  const [notifs] = useState<AppNotification[]>(MOCK_NOTIFS)

  // Live listener temporarily disabled while mocking UI.
  /*
  useEffect(() => {
    if (!user?.id) return
    const unsub = listenUserNotifications(user.id, (list) => {
      setNotifs(list.slice(0, 3))
    })
    return () => unsub()
  }, [user?.id])
  */

  if (!notifs || notifs.length === 0) return null

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <View
            style={[
              styles.avatarBorder,
              { backgroundColor: theme.colors.accentYellow },
            ]}
          >
            <Image style={styles.avatar} source={{ uri: IMAGE_PLACEHOLDER }} />
          </View>
        </View>

        <Text variant="xLarge" style={styles.name}>
          {t('dashboard.notifications.title')}
        </Text>

        <View style={styles.tagsContainer}>
          {notifs.map((n) => (
            <View
              key={n.id}
              style={[
                styles.tag,
                {
                  backgroundColor: theme.colors.accentYellow,
                  borderWidth: theme.border.size,
                  borderColor: theme.colors.borderColor,
                },
              ]}
            >
              <Text variant="medium" style={styles.tagText} numberOfLines={1}>
                {n.title || '—'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: { paddingTop: 30, flex: 1, minWidth: 0, height: 250 },
    card: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderColor: theme.colors.borderColor,
      borderWidth: 1,
      borderRadius: theme.border.radius16,
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 20,
      paddingHorizontal: theme.spacings.small,
      width: '100%',
      alignSelf: 'center',
      position: 'relative',
      height: '100%',
    },
    avatarContainer: {
      position: 'absolute',
      top: -30,
      alignSelf: 'center',
    },
    avatarBorder: {
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderRadius: 60,
      padding: 2,
      borderBottomWidth: 6,
    },
    avatar: {
      width: IMAGE_SIZE,
      height: IMAGE_SIZE,
      borderRadius: IMAGE_SIZE / 2,
      backgroundColor: theme.colors.borderColor,
    },
    name: {
      width: '100%',
      textAlign: 'center',
      borderBottomColor: theme.colors.borderColor,
      borderBottomWidth: theme.border.size,
      paddingVertical: theme.spacings.xSmall,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.colors.backgroundTertiary,
      borderRadius: theme.border.radius16,
      marginTop: theme.spacings.medium,
      paddingVertical: theme.spacings.medium,
      width: '100%',
    },
    stat: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: { fontWeight: '700' },
    statLabel: { color: '#A28D9F', fontWeight: '500' },
    divider: { width: 1, height: 30 },
    tagsContainer: {
      marginTop: theme.spacings.medium,
      gap: theme.spacings.small,
      width: '100%',
      alignItems: 'center',
    },
    tag: {
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: theme.spacings.xSmall,
      width: '100%',
    },
    tagText: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center',
    },
  })
