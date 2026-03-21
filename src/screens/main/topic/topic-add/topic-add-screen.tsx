import { Button, Container, Text, TextInput } from '@/components'
import SubContainer from '@/components/containers/sub-container/sub-container'
import { useSnackbar } from '@/components/snackbar-provider/snackbar-provider'
import { useTheme } from '@/hooks/use-theme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { topicSchema, TopicSchema } from '@/schemas/topicSchemas'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { useThemeStore } from '@/store/useThemeStore'
import { ThemeType } from '@/types/theme.type'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet } from 'react-native'

const TopicAddScreen: React.FC = () => {
  const theme = useTheme()
  const color = useThemeStore((s) => s.colorLevelUp.background_color)

  const styles = createStyles(theme, color)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TopicSchema>({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: '', description: '' },
    mode: 'onChange',
  })

  const { showSnackbar } = useSnackbar()

  const onSave = async (values: TopicSchema) => {
    const now = Date.now()
    const topic = {
      id: `${now}`,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    }

    try {
      await topicsRepository.upsert(topic as any, '/sync/topic')
      navigatorManager.goBack()
    } catch {
      showSnackbar(t('topicAdd.save_error_message'), 'error')
    }
  }

  return (
    <Container style={styles.container}>
      <SubContainer>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
          style={styles.scrollView}
        >
          <Text variant="large">{t('topicAdd.title')}</Text>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder={t('topicAdd.title_placeholder')}
                value={value}
                onChangeText={onChange}
                style={styles.input}
                error={errors.title?.message}
              />
            )}
          />

          <Text variant="large">{t('topicAdd.description')}</Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder={t('topicAdd.description_placeholder')}
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={4}
                style={styles.textArea}
                error={errors.description?.message}
              />
            )}
          />
        </ScrollView>

        <Button
          onPress={handleSubmit(onSave)}
          disabled={isSubmitting || !isValid}
          title={isSubmitting ? t('topicAdd.saving') : t('topicAdd.save')}
          style={styles.saveButton}
          background={color}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicAddScreen

const createStyles = (theme: ThemeType, color: string) =>
  StyleSheet.create({
    container: {
      backgroundColor: color,
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    contentContainer: {
      flexGrow: 1,
      paddingTop: theme.spacings.medium,
      paddingBottom: 80,
    },
    input: {
      marginVertical: theme.spacings.xMedium,
    },
    textArea: {
      marginVertical: theme.spacings.xMedium,
      height: 100,
      borderRadius: theme.spacings.large,
    },
    saveButton: {
      marginTop: theme.spacings.medium,
      alignSelf: 'center',
      position: 'absolute',
      bottom: 20,
    },
  })
