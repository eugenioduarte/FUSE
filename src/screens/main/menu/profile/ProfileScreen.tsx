import React, { useEffect, useMemo, useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Container from '../../../../components/containers/Container'
import UIText from '../../../../components/ui/UiText'
import { Colors, spacings, typography } from '../../../../constants/theme'
import {
  changeEmail,
  changePassword,
  updateAvatarUrl,
  updateDisplayName,
} from '../../../../services/firebase/authService'
import {
  setUserAvatarMeta,
  upsertUserProfile,
} from '../../../../services/firebase/userProfile.service'
import {
  AVATAR_STYLES,
  AvatarStyle,
  generateAvatarUrl,
  parseAvatarUrl,
  randomSeed,
} from '../../../../services/profile/avatar.service'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useOverlay } from '../../../../store/useOverlay'
import { passwordStrength } from '../../../../utils/password'
import { isValidEmail } from '../../../../utils/validators'

const DEFAULT_STYLE: AvatarStyle = 'adventurer'

const Profile: React.FC = () => {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { setLoadingOverlay, setErrorOverlay, setSuccessOverlay } = useOverlay()

  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')

  const initialStyle = useMemo<AvatarStyle>(() => {
    const s = (user?.avatarStyle as AvatarStyle) || DEFAULT_STYLE
    return (AVATAR_STYLES as string[]).includes(s) ? s : DEFAULT_STYLE
  }, [user?.avatarStyle])
  const initialSeed = useMemo<string>(
    () => user?.avatarSeed || randomSeed(),
    [user?.avatarSeed],
  )
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(initialStyle)
  const [avatarSeed, setAvatarSeed] = useState<string>(initialSeed)
  const generatedAvatarUrl = useMemo(
    () => generateAvatarUrl(avatarStyle, avatarSeed),
    [avatarStyle, avatarSeed],
  )
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string>(
    user?.avatarUrl || generatedAvatarUrl,
  )
  const avatarDirty = pendingAvatarUrl !== (user?.avatarUrl || '')

  // UI feedback for Profile save
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const computedDisplayName = useMemo(() => {
    if (displayName?.trim()) return displayName.trim()
    const suffix = (user?.id || '').slice(0, 4) || '1234'
    return user?.email ? user.email.split('@')[0] : `Utilizador(a) #${suffix}`
  }, [displayName, user?.email, user?.id])

  // Initialize avatar if not set
  useEffect(() => {
    if (user?.avatarUrl) {
      // Keep currently stored avatar
      updateUser({ avatarUrl: user.avatarUrl })
      // If we don't have avatar metadata yet, try to infer from URL and persist
      if (!user?.avatarStyle || !user?.avatarSeed) {
        const parsed = parseAvatarUrl(user.avatarUrl)
        if (parsed) {
          setUserAvatarMeta({
            avatarStyle: parsed.style,
            avatarSeed: parsed.seed,
          }).catch(() => {
            // ignore
          })
        }
      }
    } else {
      const url = generateAvatarUrl(avatarStyle, avatarSeed)
      // Persist both photoURL and avatar metadata on first-time setup
      Promise.all([
        updateAvatarUrl(url),
        setUserAvatarMeta({ avatarStyle, avatarSeed }),
      ]).catch(() => {
        // ignore
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // New unified save handler; we no longer autosave name on blur
  const onSaveProfile = async () => {
    if (!user) {
      setSaveMsg('Não autenticado')
      setErrorOverlay(true, 'Precisas de iniciar sessão para guardar o perfil')
      return
    }
    const tasks: Promise<any>[] = []
    const nextName = displayName.trim()
    if (nextName && nextName !== (user?.name || '')) {
      tasks.push(
        Promise.all([
          updateDisplayName(nextName),
          upsertUserProfile({ name: nextName }),
        ]),
      )
    }
    if (pendingAvatarUrl && pendingAvatarUrl !== (user?.avatarUrl || '')) {
      // Persist photoURL and avatar identity together
      tasks.push(
        Promise.all([
          updateAvatarUrl(pendingAvatarUrl),
          setUserAvatarMeta({ avatarStyle, avatarSeed }),
        ]),
      )
    }
    if (!tasks.length) {
      setSaveMsg('Nada para guardar')
      return
    }
    try {
      setSaveLoading(true)
      setSaveMsg(null)
      setLoadingOverlay(true)
      await Promise.all(tasks)
      setSuccessOverlay(true, 'Alterações guardadas')
      setSaveMsg('Alterações guardadas')
    } catch (e: any) {
      const msg = e?.message || 'Não foi possível guardar as alterações'
      setErrorOverlay(true, msg)
      setSaveMsg(msg)
    } finally {
      setSaveLoading(false)
      setLoadingOverlay(false)
    }
  }

  const onGenerateNewAvatar = () => {
    const seed = randomSeed()
    setAvatarSeed(seed)
    const url = generateAvatarUrl(avatarStyle, seed)
    setPendingAvatarUrl(url)
  }

  const onChangeStyle = (style: AvatarStyle) => {
    setAvatarStyle(style)
    const url = generateAvatarUrl(style, avatarSeed)
    setPendingAvatarUrl(url)
  }

  const onSaveEmail = async () => {
    if (!isValidEmail(email)) {
      setEmailError('Email inválido')
      return
    }
    if (!emailCurrentPassword) {
      setEmailError('Introduz a senha atual para confirmar a alteração')
      return
    }
    setEmailError(null)
    try {
      setLoadingOverlay(true)
      await changeEmail(emailCurrentPassword, email.trim())
      await upsertUserProfile({ email: email.trim() })
      setSuccessOverlay(true, 'Email atualizado. Verifica a caixa de entrada')
    } catch (e: any) {
      const msg = normalizeFirebaseError(e)
      setErrorOverlay(true, msg)
      setEmailError(msg)
    }
    setLoadingOverlay(false)
  }

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const pStrength = passwordStrength(newPassword)

  const onChangePassword = async () => {
    if (!currentPassword || !newPassword) return
    if (newPassword !== confirmPassword) return
    try {
      setLoadingOverlay(true)
      await changePassword(currentPassword, newPassword)
      setSuccessOverlay(true, 'Senha atualizada com sucesso')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setErrorOverlay(true, 'Não foi possível alterar a senha')
    }
    setLoadingOverlay(false)
  }

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <UIText variant="xxLarge" weight="semiBold" style={styles.title}>
          Perfil
        </UIText>

        {/* Avatar */}
        <View style={styles.card}>
          <UIText variant="large" weight="semiBold" style={styles.cardTitle}>
            Avatar
          </UIText>
          <View style={styles.avatarRow}>
            <Image source={{ uri: pendingAvatarUrl }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.buttonPrimary}
                onPress={onGenerateNewAvatar}
              >
                <UIText style={styles.buttonPrimaryText}>Gerar novo</UIText>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.stylesRow}>
            {AVATAR_STYLES.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => onChangeStyle(s)}
                style={[styles.chip, avatarStyle === s && styles.chipSelected]}
              >
                <UIText
                  style={[
                    styles.chipText,
                    avatarStyle === s && styles.chipTextSelected,
                  ]}
                >
                  {s}
                </UIText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Display name */}
        <View style={styles.card}>
          <UIText variant="large" weight="semiBold" style={styles.cardTitle}>
            Nome de exibição
          </UIText>
          <TextInput
            placeholder={computedDisplayName}
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
          />
          <UIText variant="small" color={Colors.light.grey}>
            Se não definir, mostraremos um nome padrão como Explorador(a) ou
            Utilizador(a) #1234.
          </UIText>
          <TouchableOpacity
            style={[
              styles.buttonPrimary,
              displayName.trim() === (user?.name || '') && !avatarDirty
                ? { opacity: 0.6 }
                : null,
            ]}
            onPress={onSaveProfile}
            disabled={displayName.trim() === (user?.name || '') && !avatarDirty}
          >
            <UIText style={styles.buttonPrimaryText}>
              {saveLoading ? 'A guardar…' : 'Guardar alterações'}
            </UIText>
          </TouchableOpacity>
          {saveMsg ? (
            <UIText
              variant="small"
              style={{ marginTop: 6, color: Colors.light.text }}
            >
              {saveMsg}
            </UIText>
          ) : null}
        </View>

        {/* Email */}
        <View style={styles.card}>
          <UIText variant="large" weight="semiBold" style={styles.cardTitle}>
            Email
          </UIText>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="o.teu@email.com"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Senha atual (necessária para alterar o email)"
            secureTextEntry
            value={emailCurrentPassword}
            onChangeText={setEmailCurrentPassword}
            style={styles.input}
          />
          {emailError ? (
            <UIText
              variant="small"
              style={{ color: Colors.light.warning_text }}
            >
              {emailError}
            </UIText>
          ) : null}
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={onSaveEmail}
          >
            <UIText style={styles.buttonSecondaryText}>Guardar email</UIText>
          </TouchableOpacity>
          <UIText variant="small" color={Colors.light.grey}>
            Ao alterar, enviaremos um email de confirmação.
          </UIText>
        </View>

        {/* Password */}
        <View style={styles.card}>
          <UIText variant="large" weight="semiBold" style={styles.cardTitle}>
            Alterar palavra‑passe
          </UIText>
          <TextInput
            placeholder="Senha atual"
            secureTextEntry
            value={currentPassword}
            onChangeText={setCurrentPassword}
            style={styles.input}
          />
          <TextInput
            placeholder="Nova senha"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
          {/* Strength meter */}
          <View style={styles.strengthRow}>
            <View
              style={[styles.strengthBar, { backgroundColor: pStrength.color }]}
            />
            <UIText style={{ marginLeft: 8 }}>{pStrength.label}</UIText>
          </View>
          <TextInput
            placeholder="Confirmar nova senha"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={onChangePassword}
            disabled={
              !currentPassword ||
              !newPassword ||
              newPassword !== confirmPassword
            }
          >
            <UIText style={styles.buttonPrimaryText}>Atualizar senha</UIText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  )
}

export default Profile

// Temporary simple secure prompt. In native, there's no prompt; you can replace with a proper modal.
function normalizeFirebaseError(e: any): string {
  const code = e?.code || ''
  if (code.includes('auth/requires-recent-login'))
    return 'É necessário voltar a autenticar.'
  if (code.includes('auth/email-already-in-use')) return 'Email já em uso.'
  if (code.includes('auth/invalid-email')) return 'Email inválido.'
  return 'Não foi possível atualizar o email.'
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacings.xLarge,
  },
  title: {
    marginBottom: spacings.large,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacings.medium,
    marginBottom: spacings.large,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardTitle: {
    marginBottom: spacings.small,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacings.small,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacings.medium,
    backgroundColor: Colors.light.background,
  },
  stylesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.background,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    ...typography.small,
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  buttonPrimary: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  buttonSecondaryText: {
    color: Colors.light.text,
    fontWeight: '700',
  },
  strengthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthBar: {
    height: 6,
    borderRadius: 3,
    flex: 1,
    backgroundColor: '#ddd',
  },
})
