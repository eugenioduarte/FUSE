import { useSnackbar } from '@/components/ui/SnackbarProvider'
import { t } from '@/locales/translation'
import {
  changeEmail,
  changePassword,
  updateAvatarUrl,
  updateDisplayName,
} from '@/services/firebase/authService'
import {
  setUserAvatarMeta,
  upsertUserProfile,
} from '@/services/firebase/userProfile.service'
import {
  AVATAR_STYLES,
  AvatarStyle,
  generateAvatarUrl,
  parseAvatarUrl,
  randomSeed,
} from '@/services/profile/avatar.service'
import { useAuthStore } from '@/store/useAuthStore'
import { useOverlay } from '@/store/useOverlay'
import { passwordStrength } from '@/utils/password'
import { isValidEmail } from '@/utils/validators'
import { useEffect, useMemo, useState } from 'react'

type UseProfileReturn = {
  displayName: string
  setDisplayName: (s: string) => void
  email: string
  setEmail: (s: string) => void
  emailError: string | null
  emailCurrentPassword: string
  setEmailCurrentPassword: (s: string) => void
  originalName: string

  avatarStyle: AvatarStyle
  avatarSeed: string
  pendingAvatarUrl: string
  avatarDirty: boolean
  onGenerateNewAvatar: () => void
  onChangeStyle: (style: AvatarStyle) => void
  AVATAR_STYLES: AvatarStyle[]

  onSaveProfile: () => Promise<void>
  saveLoading: boolean
  saveMsg: string | null
  computedDisplayName: string

  onSaveEmail: () => Promise<void>

  currentPassword: string
  setCurrentPassword: (s: string) => void
  newPassword: string
  setNewPassword: (s: string) => void
  confirmPassword: string
  setConfirmPassword: (s: string) => void
  pStrength: { label: string; color: string }
  onChangePassword: () => Promise<void>
}

export default function useProfile(): UseProfileReturn {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { setLoadingOverlay } = useOverlay()
  const { showSnackbar } = useSnackbar()

  const [displayName, setDisplayName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('')

  // Use Thumbs style for new avatars (DiceBear)
  const DEFAULT_STYLE: AvatarStyle = 'thumbs'

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

  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)

  const computedDisplayName = useMemo(() => {
    if (displayName?.trim()) return displayName.trim()
    const suffix = (user?.id || '').slice(0, 4) || '1234'
    return user?.email ? user.email.split('@')[0] : `Utilizador(a) #${suffix}`
  }, [displayName, user?.email, user?.id])

  const originalName = user?.name ?? ''

  useEffect(() => {
    if (user?.avatarUrl) {
      updateUser({ avatarUrl: user.avatarUrl })
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

      Promise.all([
        updateAvatarUrl(url),
        setUserAvatarMeta({ avatarStyle, avatarSeed }),
      ]).catch(() => {
        // ignore
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (typeof err === 'string') return err
    if (err && typeof err === 'object') {
      const maybeMsg = (err as Record<string, unknown>)['message']
      if (typeof maybeMsg === 'string') return maybeMsg
    }
    return fallback
  }

  const onSaveProfile = async () => {
    if (!user) {
      setSaveMsg(t('profile.not_authenticated'))
      showSnackbar(t('profile.need_login'), 'error')
      return
    }
    const tasks: Promise<unknown>[] = []
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
      tasks.push(
        Promise.all([
          updateAvatarUrl(pendingAvatarUrl),
          setUserAvatarMeta({ avatarStyle, avatarSeed }),
        ]),
      )
    }
    if (!tasks.length) {
      setSaveMsg(t('profile.save_none'))
      return
    }
    try {
      setSaveLoading(true)
      setSaveMsg(null)
      setLoadingOverlay(true, 'ProfileScreen')
      await Promise.all(tasks)
      // show success via SnackBar
      showSnackbar(t('profile.save_success'), 'success')
      setSaveMsg(t('profile.save_success'))
    } catch (e: unknown) {
      const msg = getErrorMessage(e, t('profile.save_failed'))
      showSnackbar(msg, 'error')
      setSaveMsg(msg)
    } finally {
      setSaveLoading(false)
      setLoadingOverlay(false)
    }
  }

  const onGenerateNewAvatar = () => {
    const seed = randomSeed()
    setAvatarSeed(seed)
    // always generate Thumbs-style avatars when user requests a new avatar
    setAvatarStyle('thumbs')
    const url = generateAvatarUrl('thumbs', seed)
    setPendingAvatarUrl(url)
  }

  const onChangeStyle = (style: AvatarStyle) => {
    setAvatarStyle(style)
    const url = generateAvatarUrl(style, avatarSeed)
    setPendingAvatarUrl(url)
  }

  const normalizeFirebaseError = (e: unknown): string => {
    let code = ''
    if (e && typeof e === 'object') {
      const maybeCode = (e as Record<string, unknown>)['code']
      if (typeof maybeCode === 'string') code = maybeCode
    }
    if (code.includes('auth/requires-recent-login'))
      return t('profile.reauth_required')
    if (code.includes('auth/email-already-in-use'))
      return t('profile.email.already_in_use')
    if (code.includes('auth/invalid-email')) return t('profile.email.invalid')
    return t('profile.email.update_failed')
  }

  const onSaveEmail = async () => {
    if (!isValidEmail(email)) {
      setEmailError(t('profile.email.invalid'))
      return
    }
    if (!emailCurrentPassword) {
      setEmailError(t('profile.email.current_password_required'))
      return
    }
    setEmailError(null)
    try {
      setLoadingOverlay(true, 'ProfileScreen')
      await changeEmail(emailCurrentPassword, email.trim())
      await upsertUserProfile({ email: email.trim() })
      showSnackbar(t('profile.email.updated'), 'success')
    } catch (e: unknown) {
      const msg = normalizeFirebaseError(e)
      showSnackbar(msg, 'error')
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
      setLoadingOverlay(true, 'ProfileScreen')
      await changePassword(currentPassword, newPassword)
      showSnackbar(t('profile.password.updated'), 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      showSnackbar(t('profile.password.update_failed'), 'error')
    }
    setLoadingOverlay(false)
  }

  return {
    displayName,
    setDisplayName,
    email,
    setEmail,
    emailError,
    emailCurrentPassword,
    setEmailCurrentPassword,

    avatarStyle,
    avatarSeed,
    pendingAvatarUrl,
    avatarDirty,
    onGenerateNewAvatar,
    onChangeStyle,
    AVATAR_STYLES,

    onSaveProfile,
    saveLoading,
    saveMsg,
    computedDisplayName,

    originalName,

    onSaveEmail,

    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    pStrength,
    onChangePassword,
  }
}
