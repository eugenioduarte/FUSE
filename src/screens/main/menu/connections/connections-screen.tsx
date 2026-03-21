import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  findUserByEmailFull,
  isAlreadyConnected,
  listenAcceptedConnections,
  listenConnectionRequest,
  sendConnectionRequest,
  type PublicUser,
} from '../../../../services/firebase/connections.service'
import { useAuthStore } from '../../../../store/useAuthStore'

const ConnectionsScreen: React.FC = () => {
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

  // Realtime connections list
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

  const canSend = useMemo(() => {
    return !!user && status === 'none'
  }, [user, status])

  async function search() {
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await findUserByEmailFull(email.trim())
      setUser(res)
      setStatus('none')
      // Detach previous listener
      try {
        unsubRef.current?.()
      } catch {}
      if (res && myUid) {
        // Check if already connected
        const connected = await isAlreadyConnected(myUid, res.uid)
        if (connected) {
          setStatus('connected')
          return
        }
        // Attach status listener
        unsubRef.current = listenConnectionRequest(myUid, res.uid, (req) => {
          if (req) setStatus(req.status)
          else setStatus('none')
        })
      }
    } catch (e: any) {
      setError(e?.message || 'Erro ao procurar utilizador')
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
      setError(e?.message || 'Erro ao enviar pedido')
    } finally {
      setLoading(false)
    }
  }

  const renderResult = () => {
    if (loading)
      return <ActivityIndicator color="#fff" style={{ marginTop: 16 }} />
    if (error) return <Text style={styles.error}>{error}</Text>
    if (!user)
      return email.trim() ? (
        <Text style={styles.muted}>Nenhum utilizador encontrado</Text>
      ) : null

    return (
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={{ color: '#111', fontWeight: '800' }}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {user.name || 'Utilizador'}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
          <StatusPill status={status} />
        </View>

        {canSend ? (
          <TouchableOpacity style={styles.button} onPress={send}>
            <Text style={styles.buttonText}>Enviar pedido</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>Adicionar conexão por e-mail</Text>
        <View style={styles.row}>
          <TextInput
            placeholder="email@exemplo.com"
            placeholderTextColor="#8b8b8b"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={search}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={search}>
            <Text style={styles.buttonText}>Procurar</Text>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>{renderResult()}</View>

        <View style={{ height: 24 }} />
        <Text style={styles.title}>As minhas conexões</Text>
        {loadingConnections ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
        ) : myConnections.length === 0 ? (
          <Text style={styles.muted}>Sem conexões.</Text>
        ) : (
          <View style={{ marginTop: 8, gap: 8 }}>
            {myConnections.map((c) => (
              <View key={c.uid} style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {c.avatarUrl ? (
                    <Image
                      source={{ uri: c.avatarUrl }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarFallback]}>
                      <Text style={{ color: '#111', fontWeight: '800' }}>
                        {c.name?.[0]?.toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.name} numberOfLines={1}>
                      {c.name || 'Utilizador'}
                    </Text>
                    {!!c.email && (
                      <Text style={styles.email} numberOfLines={1}>
                        {c.email}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const StatusPill: React.FC<{
  status: 'none' | 'pending' | 'accepted' | 'declined' | 'connected'
}> = ({ status }) => {
  const map: Record<string, { label: string; bg: string; fg: string }> = {
    none: { label: 'Disponível', bg: '#374151', fg: '#fff' },
    pending: { label: 'Pendente', bg: '#fbbf24', fg: '#111' },
    accepted: { label: 'Aceite', bg: '#10b981', fg: '#111' },
    declined: { label: 'Recusado', bg: '#ef4444', fg: '#fff' },
    connected: { label: 'Ligados', bg: '#10b981', fg: '#111' },
  }
  const s = map[status]
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={{ color: s.fg, fontWeight: '700' }}>{s.label}</Text>
    </View>
  )
}

export default ConnectionsScreen

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  title: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  searchBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  button: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: { color: 'white', fontWeight: '800' },
  muted: { color: '#9ca3af' },
  error: { color: '#ef4444', marginTop: 12 },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#222' },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
  name: { color: 'white', fontWeight: '800' },
  email: { color: '#9ca3af' },
  pill: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999 },
})
