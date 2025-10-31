import { Button, Container, Text, TextInput } from '@/components'
import SubContainer from '@/components/containers/SubContainer'
import { useSnackbar } from '@/components/ui/SnackbarProvider'
import { Colors } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { t } from '@/locales/translation'
import { navigatorManager } from '@/navigation/navigatorManager'
import { topicSchema, TopicSchema } from '@/schemas/topicSchemas'
import { topicsRepository } from '@/services/repositories/topics.repository'
import { ThemeType } from '@/types/theme.type'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

const TopicAddScreen: React.FC = () => {
  const theme = useTheme()
  const styles = createStyles(theme)
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<TopicSchema>({
    resolver: zodResolver(topicSchema),
    defaultValues: { title: '', description: '', backgroundColor: '' },
    mode: 'onChange',
  })

  const backgroundColor = watch('backgroundColor')

  const colorEntries = useMemo(
    () => Object.entries(Colors.backgroundTextColors),
    [],
  )

  const { showSnackbar } = useSnackbar()

  const onSave = async (values: TopicSchema) => {
    const now = Date.now()
    const topic = {
      id: `${now}`,
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      backgroundColor: values.backgroundColor || undefined,
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

          <Text variant="large" style={{ marginTop: 16 }}>
            {t('topicAdd.background_label')}
          </Text>

          <View style={styles.colorsContainer}>
            {colorEntries.map(([name, color]) => {
              const selected = backgroundColor === color
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() =>
                    setValue('backgroundColor', color, { shouldValidate: true })
                  }
                  style={[
                    styles.colorDot,
                    { backgroundColor: color, borderWidth: selected ? 3 : 1 },
                  ]}
                />
              )
            })}
          </View>
        </ScrollView>

        <Button
          onPress={handleSubmit(onSave)}
          disabled={isSubmitting || !isValid}
          title={isSubmitting ? t('topicAdd.saving') : t('topicAdd.save')}
          style={styles.saveButton}
          background={theme.colors.accentPurple}
        />
      </SubContainer>
    </Container>
  )
}

export default TopicAddScreen

const createStyles = (theme: ThemeType) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.accentPurple,
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
    colorsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      gap: theme.spacings.small,
      marginTop: theme.spacings.xMedium,
    },
    colorDot: {
      width: 40,
      height: 40,
      borderRadius: 999,
      borderColor: theme.colors.borderColor,
      alignItems: 'center',
    },
    saveButton: {
      marginTop: theme.spacings.medium,
      alignSelf: 'center',
    },
  })
