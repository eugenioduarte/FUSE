import { Button, Text, TextInput } from '@/components'
import Container from '@/components/containers/container/container'
import HeaderCloseTitle from '@/components/headers/header-close-title/header-close-title'
import { Colors } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { ColorLevels, useThemeStore } from '@/store/theme.store'
import { ThemeType } from '@/types/theme.type'
import React from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { ColorWheel } from './components/color-picker'
import useProfile from './profile.hook'

type Styles = ReturnType<typeof createStyles>

type AvatarSectionProps = {
  styles: Styles
  pendingAvatarUrl: string
  onGenerateNewAvatar: () => void
  color?: string
}

const AvatarSection = ({
  styles,
  pendingAvatarUrl,
  onGenerateNewAvatar,
  color,
}: AvatarSectionProps) => (
  <View style={styles.cardNoBottom}>
    <Text variant="large" weight="semiBold" style={styles.cardTitle}>
      {t('profile.avatar.title')}
    </Text>

    <View style={styles.avatarRow}>
      <Image source={{ uri: pendingAvatarUrl }} style={styles.avatar} />
      <Button
        title={t('profile.avatar.generate')}
        onPress={onGenerateNewAvatar}
        background={color}
        style={styles.buttonCenter}
      />
    </View>
  </View>
)

type DisplayNameSectionProps = {
  styles: Styles
  displayName: string
  setDisplayName: (val: string) => void
  computedDisplayName: string
  saveLoading: boolean
  onSaveProfile: () => void
  originalName: string
  avatarDirty: boolean
  color?: string
}

const DisplayNameSection = ({
  styles,
  displayName,
  setDisplayName,
  computedDisplayName,
  saveLoading,
  onSaveProfile,
  originalName,
  avatarDirty,
  color,
}: DisplayNameSectionProps) => (
  <View style={styles.cardNoTop}>
    <Text variant="large" weight="semiBold" style={styles.cardTitle}>
      {t('profile.displayName.title')}
    </Text>

    <TextInput
      placeholder={computedDisplayName}
      value={displayName}
      onChangeText={setDisplayName}
      style={styles.input}
    />

    <Button
      title={saveLoading ? t('profile.saving') : t('profile.save')}
      onPress={onSaveProfile}
      background={color}
      style={styles.buttonCenter}
      disabled={displayName.trim() === originalName && !avatarDirty}
    />
  </View>
)

type EmailSectionProps = {
  styles: Styles
  email: string
  setEmail: (val: string) => void
  emailError: string | null
  emailCurrentPassword: string
  setEmailCurrentPassword: (val: string) => void
  onSaveEmail: () => void
  color?: string
}

const EmailSection = ({
  styles,
  email,
  setEmail,
  emailError,
  emailCurrentPassword,
  setEmailCurrentPassword,
  onSaveEmail,
  color,
}: EmailSectionProps) => (
  <View style={styles.card}>
    <Text variant="large" weight="semiBold" style={styles.cardTitle}>
      {t('profile.email.title')}
    </Text>

    <TextInput
      autoCapitalize="none"
      keyboardType="email-address"
      placeholder={t('profile.email.placeholder')}
      value={email}
      onChangeText={setEmail}
      style={styles.input}
    />

    <TextInput
      placeholder={t('profile.email.current_password_placeholder')}
      secureTextEntry
      value={emailCurrentPassword}
      onChangeText={setEmailCurrentPassword}
      style={styles.input}
    />

    {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

    <Button
      title={t('profile.email.save')}
      onPress={onSaveEmail}
      background={color}
      style={styles.buttonCenterMargin}
    />

    <Text variant="small" color={Colors.light.textSecondary}>
      {t('profile.email.note')}
    </Text>
  </View>
)

type PasswordSectionProps = {
  styles: Styles
  currentPassword: string
  newPassword: string
  confirmPassword: string
  setCurrentPassword: (val: string) => void
  setNewPassword: (val: string) => void
  setConfirmPassword: (val: string) => void
  pStrength: { label: string; color: string }
  onChangePassword: () => void
  color?: string
}

const PasswordSection = ({
  styles,
  currentPassword,
  newPassword,
  confirmPassword,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  pStrength,
  onChangePassword,
  color,
}: PasswordSectionProps) => (
  <View style={styles.card}>
    <Text variant="large" weight="semiBold" style={styles.cardTitle}>
      {t('profile.password.title')}
    </Text>

    <TextInput
      placeholder={t('profile.password.current')}
      secureTextEntry
      value={currentPassword}
      onChangeText={setCurrentPassword}
      style={styles.input}
    />

    <TextInput
      placeholder={t('profile.password.new')}
      secureTextEntry
      value={newPassword}
      onChangeText={setNewPassword}
      style={styles.input}
    />

    <View style={styles.strengthRow}>
      <View
        style={[styles.strengthBar, { backgroundColor: pStrength.color }]}
      />
      <Text style={styles.strengthLabel}>{pStrength.label}</Text>
    </View>

    <TextInput
      placeholder={t('profile.password.confirm')}
      secureTextEntry
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      style={styles.input}
    />

    <Button
      title={t('profile.password.update')}
      onPress={onChangePassword}
      background={color}
      style={styles.buttonCenterMargin}
    />
  </View>
)

const ColorPickerContainer: React.FC<{ styles: Styles }> = ({ styles }) => {
  return (
    <View style={styles.card}>
      <Text variant="large" weight="semiBold" style={styles.cardTitle}>
        {t('profile.avatar.color')}
      </Text>

      <View style={{ alignItems: 'center' }}>
        <ColorWheel />
      </View>
    </View>
  )
}

const Profile: React.FC = () => {
  const {
    displayName,
    setDisplayName,
    email,
    setEmail,
    emailError,
    emailCurrentPassword,
    setEmailCurrentPassword,

    pendingAvatarUrl,
    avatarDirty,
    onGenerateNewAvatar,

    onSaveProfile,
    saveLoading,
    computedDisplayName,

    onSaveEmail,

    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    pStrength,
    onChangePassword,

    originalName,
  } = useProfile()

  const theme = useTheme()
  const colors = useThemeStore((s) => s.colorLevelUp)
  const styles = createStyles(theme, colors)

  return (
    <Container style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <HeaderCloseTitle title={t('profile.title')} />

        <ColorPickerContainer styles={styles} />

        <AvatarSection
          styles={styles}
          pendingAvatarUrl={pendingAvatarUrl}
          onGenerateNewAvatar={onGenerateNewAvatar}
          color={colors.background_color}
        />

        <DisplayNameSection
          styles={styles}
          displayName={displayName}
          setDisplayName={setDisplayName}
          computedDisplayName={computedDisplayName}
          saveLoading={saveLoading}
          onSaveProfile={onSaveProfile}
          originalName={originalName}
          avatarDirty={avatarDirty}
          color={colors.background_color}
        />

        <EmailSection
          styles={styles}
          email={email}
          setEmail={setEmail}
          emailError={emailError}
          emailCurrentPassword={emailCurrentPassword}
          setEmailCurrentPassword={setEmailCurrentPassword}
          onSaveEmail={onSaveEmail}
          color={colors.background_color}
        />

        <PasswordSection
          styles={styles}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          setCurrentPassword={setCurrentPassword}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          pStrength={pStrength}
          onChangePassword={onChangePassword}
          color={colors.background_color}
        />
      </ScrollView>
    </Container>
  )
}

export default Profile

const createStyles = (theme: ThemeType, colors?: ColorLevels) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors?.background_color,
      paddingTop: 0,
    },
    contentContainer: {
      paddingBottom: theme.spacings.xLarge,
      paddingHorizontal: theme.spacings.medium,
    },

    card: {
      backgroundColor: theme.colors.backgroundPrimary,
      borderRadius: theme.spacings.xMedium,
      padding: theme.spacings.medium,
      marginBottom: theme.spacings.large,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
    },
    cardNoBottom: {
      backgroundColor: theme.colors.backgroundPrimary,
      borderRadius: theme.spacings.xMedium,
      padding: theme.spacings.medium,
      marginBottom: 0,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderBottomEndRadius: 0,
      borderBottomStartRadius: 0,
      borderBottomWidth: 0,
    },
    cardNoTop: {
      backgroundColor: theme.colors.backgroundPrimary,
      borderRadius: theme.spacings.xMedium,
      padding: theme.spacings.medium,
      marginBottom: theme.spacings.large,
      borderWidth: theme.border.size,
      borderColor: theme.colors.borderColor,
      borderTopEndRadius: 0,
      borderTopStartRadius: 0,
      borderTopWidth: 0,
    },
    cardTitle: {
      marginBottom: theme.spacings.small,
    },

    avatarRow: {
      alignItems: 'center',
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: theme.spacings.medium,
      backgroundColor: theme.colors.backgroundPrimary,
    },
    stylesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.spacings.medium,
      backgroundColor: theme.colors.backgroundSecondary,
    },
    chipSelected: {
      backgroundColor: theme.colors.accentBlue,
    },
    chipText: {
      color: theme.colors.textPrimary,
      ...theme.typography.small,
    },
    chipTextSelected: {
      color: '#fff',
    },

    input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: theme.spacings.small,
      paddingHorizontal: theme.spacings.xMedium,
      paddingVertical: theme.spacings.xMedium,
      marginBottom: theme.spacings.small,
    },

    buttonPrimary: {
      backgroundColor: theme.colors.accentBlue,
      borderRadius: theme.spacings.small,
      paddingVertical: theme.spacings.xMedium,
      alignItems: 'center',
      marginTop: 4,
    },
    buttonPrimaryText: {
      color: '#fff',
      fontWeight: '700',
    },
    buttonSecondary: {
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.spacings.small,
      paddingVertical: theme.spacings.xMedium,
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 6,
    },
    buttonSecondaryText: {
      color: theme.colors.textPrimary,
      fontWeight: '700',
    },
    disabled: {
      opacity: 0.6,
    },
    buttonCenter: {
      alignSelf: 'center',
      marginBottom: theme.spacings.medium,
    },
    buttonCenterMargin: {
      alignSelf: 'center',
      marginVertical: theme.spacings.medium,
    },
    saveMsg: {
      marginTop: 6,
      color: theme.colors.textPrimary,
    },

    strengthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacings.small,
    },
    strengthBar: {
      height: 6,
      borderRadius: 3,
      flex: 1,
      backgroundColor: '#ddd',
    },
    strengthLabel: {
      marginLeft: theme.spacings.small,
      color: theme.colors.textPrimary,
    },

    error: {
      color: theme.colors.accentYellow,
    },
  })
