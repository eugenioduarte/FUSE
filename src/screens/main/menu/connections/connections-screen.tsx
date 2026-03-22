import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Button, Container, Text } from '@/components'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import {
  findUserByEmailFull,
  isAlreadyConnected,
  listenAcceptedConnections,
  listenConnectionRequest,
  sendConnectionRequest,
  type PublicUser,
} from '../../../../services/firebase/connections.service'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'

const ConnectionsScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)
  const styles = createStyles(theme, color)

  const myUid = useAuthStore((s) => s.user?.id)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<PublicUser | null>(null)
  const [status, setStatus] = useState<
    'none' | 'pending' | 'accepted' | 'declined' | 'connected'
  >('none')
  const [myConnections, setMyConnections] = useState<PublicUser[]>([])
  const [loadingConnections, setLoadingConnections] = useState(true)

  const unsubRef = useRef<null | (() => void)>(null)

  useEffect(() => {
    return () => {
      try {
        unsubRef.current?.()
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!myUid) return
    setLoadingConnections(true)
    const unsub = listenAcceptedConnections(myUid, (profiles) => {
      setMyConnections(profiles)
      setLoadingConnections(false)
    })
    return () => {
      try {
        unsub()
      } catch {}
    }
  }, [myUid])

  const canSend = useMemo(() => !!user && status === 'none', [user, status])

  async function search() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await findUserByEmailFull(email.trim())
      setUser(res)
      setStatus('none')
      try {
        unsubRef.current?.()
      } catch {}
      if (res && myUid) {
        const connected = await isAlreadyConnected(myUid, res.uid)
        if (connected) {
          setStatus('connected')
          return
        }
        unsubRef.current = listenConnectionRequest(myUid, res.uid, (req) => {
          if (req) setStatus(req.status)
          else setStatus('none')
        })
      }
    } catch (e: any) {
      setError(e?.message || t('connections.search_error'))
    } finally {
      setLoading(false)
    }
  }

  async function send() {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      await sendConnectionRequest(user.uid)
    } catch (e: any) {
      setError(e?.message || t('connections.send_error'))
    } finally {
      setLoading(false)
    }
  }

  const renderSearchResult = () => {
    if (loading) return <ActivityIndicator color={theme.colors.backgroundTertiary} style={styles.loader} />
    if (error) return <Text variant="medium" style={styles.error}>{error}</Text>
    if (!user) {
      return email.trim()
        ? <Text variant="medium" style={styles.muted}>{t('connections.user_not_found')}</Text>
        : null
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <UserAvatar user={user} styles={styles} />
          <View style={styles.cardInfo}>
            <Text variant="large" style={styles.name} numberOfLines={1}>
              {user.name || t('user.default')}
            </Text>
            <Text variant="medium" style={styles.muted} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
          <StatusPill status={status} theme={theme} styles={styles} />
        </View>
        {canSend && (
          <Button
            title={t('connections.send_request')}
            onPress={send}
            background={theme.colors.backgroundTertiary}
            style={styles.sendButton}
          />
        )}
      </View>
    )
  }

  return (
    <Container style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="xxLarge" style={styles.sectionTitle}>
          {t('connections.add_title')}
        </Text>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="email@exemplo.com"
            placeholderTextColor={theme.colors.borderColor}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={search}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={search}>
            <Text variant="medium" style={styles.searchBtnText}>
              {t('connections.search')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.resultContainer}>{renderSearchResult()}</View>

        <View style={styles.divider} />

        <Text variant="xxLarge" style={styles.sectionTitle}>
          {t('connections.my_connections')}
        </Text>

        {loadingConnections ? (
          <ActivityIndicator color={theme.colors.backgroundTertiary} style={styles.loader} />
        ) : myConnections.length === 0 ? (
          <Text variant="medium" style={styles.muted}>
            {t('connections.no_connections')}
          </Text>
        ) : (
          <View style={styles.list}>
            {myConnections.map((c) => (
              <View key={c.uid} style={styles.card}>
                <View style={styles.cardRow}>
                  <UserAvatar user={c} styles={styles} />
                  <View style={styles.cardInfo}>
                    <Text variant="large" style={styles.name} numberOfLines={1}>
                      {c.name || t('user.default')}
                    </Text>
                    {!!c.email && (
                      <Text variant="medium" style={styles.muted} numberOfLines={1}>
                        {c.email}
                      </Text>
                    )}
                  </View>
                  <StatusPill status="connected" theme={theme} styles={styles} />
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Container>
  )
}

const UserAvatar: React.FC<{ user: PublicUser; styles: any }> = ({ user, styles }) => {
  if (user.avatarUrl) {
    return <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
  }
  return (
    <View style={[styles.avatar, styles.avatarFallback]}>
      <Text variant="medium" style={styles.avatarLetter}>
        {user.name?.[0]?.toUpperCase() || '?'}
      </Text>
    </View>
  )
}

const StatusPill: React.FC<{
  status: 'none' | 'pending' | 'accepted' | 'declined' | 'connected'
  theme: ThemeType
  styles: any
}> = ({ status, theme, styles }) => {
  const map: Record<string, { label: string; bg: string }> = {
    none: { label: t('connections.status.available'), bg: theme.colors.borderColor },
    pending: { label: t('connections.status.pending'), bg: '#fbbf24' },
    accepted: { label: t('connections.status.accepted'), bg: '#10b981' },
    declined: { label: t('connections.status.declined'), bg: theme.colors.accentRed },
    connected: { label: t('connections.status.connected'), bg: '#10b981' },
  }
  const s = map[status]
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text variant="medium" style={styles.pillText}>{s.label}</Text>
    </View>
  )
}

export default ConnectionsScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color,
      paddingTop: theme.spacings.large,
    },
    scrollView: { flex: 1 },
    scrollContent: {
      padding: theme.spacings.medium,
      paddingBottom: theme.spacings.xLarge,
    },
    sectionTitle: {
      marginBottom: theme.spacings.medium,
    },
    searchRow: {
      flexDirection: 'row',
      gap: theme.spacings.small,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.backgroundPrimary,
      color: theme.colors.textPrimary,
      paddingHorizontal: theme.spacings.medium,
      paddingVertical: theme.spacings.small,
      borderRadius: theme.border.radius12,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderBottomWidth: theme.border.shadow,
      borderRightWidth: theme.border.shadow,
    },
    searchBtn: {
      backgroundColor: theme.colors.backgroundPrimary,
      paddingHorizontal: theme.spacings.medium,
      paddingVertical: theme.spacings.small,
      borderRadius: theme.border.radius12,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderBottomWidth: theme.border.shadow,
      borderRightWidth: theme.border.shadow,
    },
    searchBtnText: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    resultContainer: {
      marginTop: theme.spacings.medium,
    },
    loader: {
      marginTop: theme.spacings.medium,
    },
    error: {
      color: theme.colors.accentRed,
      marginTop: theme.spacings.small,
    },
    muted: {
      color: theme.colors.borderColor,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.borderColor,
      marginVertical: theme.spacings.large,
    },
    list: {
      gap: theme.spacings.small,
    },
    card: {
      backgroundColor: theme.colors.backgroundPrimary,
      borderRadius: theme.border.radius16,
      padding: theme.spacings.medium,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderBottomWidth: theme.border.shadow,
      borderRightWidth: theme.border.shadow,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardInfo: {
      marginLeft: theme.spacings.medium,
      flex: 1,
    },
    name: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
    },
    avatarFallback: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.borderColor,
    },
    avatarLetter: {
      color: theme.colors.black,
      fontWeight: '800',
    },
    pill: {
      paddingHorizontal: theme.spacings.small,
      paddingVertical: theme.spacings.xSmall,
      borderRadius: 999,
    },
    pillText: {
      color: theme.colors.black,
      fontWeight: '700',
    },
    sendButton: {
      marginTop: theme.spacings.medium,
      alignSelf: 'flex-start',
    },
  })
