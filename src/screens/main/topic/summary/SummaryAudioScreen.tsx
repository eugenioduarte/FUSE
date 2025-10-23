import { RouteProp, useRoute } from '@react-navigation/native'
import type { AVPlaybackStatus } from 'expo-av'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  navigatorManager,
  RootStackParamList,
} from '../../../../navigation/navigatorManager'
import { aiService } from '../../../../services/ai/ai.service'
import { summariesRepository } from '../../../../services/repositories/summaries.repository'
import { topicsRepository } from '../../../../services/repositories/topics.repository'
import { localCache } from '../../../../storage/localCache'

const imageKey = (id: string) => `summary:image:${id}`
const audioKey = (id: string) => `summary:audio:${id}`

const SPEEDS = [0.75, 1, 1.25, 1.5] as const

type Speed = (typeof SPEEDS)[number]

const SummaryAudioScreen: React.FC = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'SummaryAudioScreen'>>()
  const summaryId = route.params?.summaryId!

  const [loading, setLoading] = useState(true)
  const [topicColor, setTopicColor] = useState<string | undefined>()
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')

  const [imageUri, setImageUri] = useState<string | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [loop, setLoop] = useState(false)
  const [speed, setSpeed] = useState<Speed>(1)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)

  const soundRef = useRef<Audio.Sound | null>(null)

  const bg = topicColor || '#0b0b0c'
  const titleColor = topicColor ? '#111' : '#fff'
  const textColor = topicColor ? '#222' : '#ddd'

  useEffect(() => {
    let active = true
    async function prepare() {
      try {
        const summary = await summariesRepository.getById(summaryId)
        if (!active) return
        if (!summary) throw new Error('Resumo não encontrado')
        setTitle(summary.title || 'Resumo')
        setContent(summary.content)
        const topic = await topicsRepository.getById(summary.topicId)
        if (active) setTopicColor(topic?.backgroundColor || undefined)

        const ensuredImg = await ensureImage(
          summaryId,
          summary.title,
          summary.content,
        )
        if (active && ensuredImg) setImageUri(ensuredImg)

        const ensuredAud = await ensureAudio(summaryId, summary.content)
        if (active && ensuredAud) setAudioUri(ensuredAud)

        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
        Alert.alert('Erro', 'Não foi possível preparar o modo áudio.')
      }
    }
    prepare()
    return () => {
      active = false
      ;(async () => {
        try {
          const s = soundRef.current
          if (s) {
            await s.unloadAsync()
            soundRef.current = null
          }
        } catch {}
      })()
    }
  }, [summaryId])

  useEffect(() => {
    if (!audioUri) return
    let mounted = true
    async function setupAudio() {
      try {
        // Prepare Expo AV
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
          interruptionModeAndroid: 1,
          interruptionModeIOS: 1,
        })
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri! },
          {
            shouldPlay: false,
            shouldCorrectPitch: true,
          },
        )
        if (!mounted) return
        soundRef.current = sound
        sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return
          setPosition(status.positionMillis || 0)
          setDuration(status.durationMillis || 0)
          setIsPlaying(status.isPlaying || false)
          if (status.didJustFinish && !status.isLooping) {
            // finished and not looping
            setIsPlaying(false)
          }
        })
      } catch (e) {
        console.error(e)
        Alert.alert('Erro', 'Falha ao carregar o áudio.')
      }
    }
    setupAudio()
    return () => {
      mounted = false
    }
  }, [audioUri])

  // Keep speed/loop in sync without recreating the sound
  useEffect(() => {
    const s = soundRef.current
    if (!s) return
    const update = async () => {
      try {
        await s.setRateAsync(speed, true)
        await s.setIsLoopingAsync(loop)
      } catch {}
    }
    update()
  }, [speed, loop])

  const onTogglePlay = async () => {
    const s = soundRef.current
    if (!s) return
    const st = await s.getStatusAsync()
    if (!st.isLoaded) return
    if (st.isPlaying) await s.pauseAsync()
    else await s.playAsync()
  }

  const onChangeSpeed = async (next: Speed) => {
    setSpeed(next)
  }

  const onToggleLoop = async () => {
    setLoop((prev) => !prev)
  }

  const onSeek = async (ms: number) => {
    const s = soundRef.current
    if (!s) return
    try {
      await s.setPositionAsync(ms)
    } catch {}
  }

  const onReplay = async () => {
    const s = soundRef.current
    if (!s) return
    try {
      await s.setPositionAsync(0)
      await s.playAsync()
    } catch {}
  }

  const onDownload = async () => {
    if (!audioUri) return
    try {
      setDownloading(true)
      const filename = `Resumo_${summaryId}_${Date.now()}.mp3`
      const dest = `${FileSystem.documentDirectory}${filename}`
      await FileSystem.copyAsync({ from: audioUri, to: dest })
      Alert.alert('Salvo', `Áudio salvo em: ${dest}`)
    } catch (e) {
      console.error(e)
      Alert.alert('Erro', 'Não foi possível salvar o áudio.')
    } finally {
      setDownloading(false)
    }
  }

  const pct = useMemo(() => {
    if (!duration) return 0
    return Math.max(0, Math.min(1, position / duration))
  }, [position, duration])

  // no-op here; format is handled in PlayerPanel

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
        }}
      >
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: titleColor, fontSize: 18, fontWeight: '700' }}>
            {title}
          </Text>
          <TouchableOpacity onPress={() => navigatorManager.goBack()}>
            <Text style={{ color: '#2563eb', fontWeight: '700' }}>Voltar</Text>
          </TouchableOpacity>
        </View>

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{
              width: '100%',
              height: 220,
              borderRadius: 12,
              marginTop: 12,
              backgroundColor: '#111214',
            }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 220,
              borderRadius: 12,
              marginTop: 12,
              backgroundColor: '#111214',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#9ca3af' }}>Gerando imagem…</Text>
          </View>
        )}

        <PlayerPanel
          topicColor={topicColor}
          textColor={textColor}
          audioUri={audioUri}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          speed={speed}
          onChangeSpeed={onChangeSpeed}
          loop={loop}
          onToggleLoop={onToggleLoop}
          pct={pct}
          position={position}
          duration={duration}
          onSeek={onSeek}
          onReplay={onReplay}
          onDownload={onDownload}
          downloading={downloading}
        />

        {/* Optional: written content preview */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{ color: titleColor, fontWeight: '700', marginBottom: 4 }}
          >
            Transcrição (texto do resumo)
          </Text>
          <Text style={{ color: textColor, lineHeight: 20 }}>{content}</Text>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  )
}

async function writeBase64ToCache(filename: string, base64: string) {
  const target = `${FileSystem.cacheDirectory}${filename}`
  try {
    await FileSystem.writeAsStringAsync(target, base64, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return target
  } catch (e) {
    console.error('writeBase64 error', e)
    throw e
  }
}

function formatTime(ms: number) {
  const sec = Math.floor(ms / 1000)
  const m = Math.floor(sec / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(m)}:${pad(s)}`
}

type PlayerProps = {
  topicColor?: string
  textColor: string
  audioUri: string | null
  isPlaying: boolean
  onTogglePlay: () => Promise<void>
  speed: Speed
  onChangeSpeed: (s: Speed) => void | Promise<void>
  loop: boolean
  onToggleLoop: () => void | Promise<void>
  pct: number
  position: number
  duration: number
  onSeek: (ms: number) => Promise<void>
  onReplay: () => Promise<void>
  onDownload: () => Promise<void>
  downloading: boolean
}

function TopControls(
  props: Readonly<{
    isPlaying: boolean
    onTogglePlay: () => Promise<void>
    speed: Speed
    onChangeSpeed: (s: Speed) => void | Promise<void>
    loop: boolean
    onToggleLoop: () => void | Promise<void>
    textColor: string
  }>,
) {
  const {
    isPlaying,
    onTogglePlay,
    speed,
    onChangeSpeed,
    loop,
    onToggleLoop,
    textColor,
  } = props
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <TouchableOpacity
        onPress={onTogglePlay}
        style={{
          backgroundColor: '#3b82f6',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>
          {isPlaying ? 'Pausar' : 'Reproduzir'}
        </Text>
      </TouchableOpacity>

      <SpeedSelector
        speed={speed}
        onChangeSpeed={onChangeSpeed}
        textColor={textColor}
      />

      <TouchableOpacity
        onPress={onToggleLoop}
        style={{
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 999,
          backgroundColor: loop ? '#059669' : 'transparent',
          borderWidth: 1,
          borderColor: '#374151',
        }}
      >
        <Text style={{ color: loop ? 'white' : textColor }}>Loop</Text>
      </TouchableOpacity>
    </View>
  )
}

function SpeedSelector(
  props: Readonly<{
    speed: Speed
    onChangeSpeed: (s: Speed) => void | Promise<void>
    textColor: string
  }>,
) {
  const { speed, onChangeSpeed, textColor } = props
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {SPEEDS.map((sp) => (
        <TouchableOpacity
          key={String(sp)}
          onPress={() => onChangeSpeed(sp)}
          style={{
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: speed === sp ? '#2563eb' : 'transparent',
            borderWidth: 1,
            borderColor: '#374151',
          }}
        >
          <Text style={{ color: speed === sp ? 'white' : textColor }}>
            {sp}x
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function ProgressSection(
  props: Readonly<{
    textColor: string
    pct: number
    position: number
    duration: number
    onSeek: (ms: number) => Promise<void>
  }>,
) {
  const { textColor, pct, position, duration, onSeek } = props
  return (
    <View style={{ marginTop: 12 }}>
      <View
        style={{ height: 6, backgroundColor: '#2B2C30', borderRadius: 999 }}
      >
        <View
          style={{
            height: 6,
            width: `${Math.round(pct * 100)}%`,
            backgroundColor: '#3b82f6',
            borderRadius: 999,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 4,
        }}
      >
        <Text style={{ color: textColor }}>{formatTime(position)}</Text>
        <Text style={{ color: textColor }}>{formatTime(duration)}</Text>
      </View>
      {/* Simple seek controls */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <TouchableOpacity onPress={() => onSeek(Math.max(0, position - 10000))}>
          <Text style={{ color: '#60a5fa' }}>{'<< 10s'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onSeek(Math.min(duration, position + 10000))}
        >
          <Text style={{ color: '#60a5fa' }}>{'10s >>'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function PlayerPanel(props: Readonly<PlayerProps>) {
  const {
    topicColor,
    textColor,
    audioUri,
    isPlaying,
    onTogglePlay,
    speed,
    onChangeSpeed,
    loop,
    onToggleLoop,
    pct,
    position,
    duration,
    onSeek,
    onReplay,
    onDownload,
    downloading,
  } = props

  return (
    <View
      style={{
        backgroundColor: topicColor ? '#ffffffaa' : '#111214',
        borderColor: topicColor ? '#e5e7eb' : '#2B2C30',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginTop: 16,
      }}
    >
      {audioUri ? (
        <>
          <TopControls
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
            speed={speed}
            onChangeSpeed={onChangeSpeed}
            loop={loop}
            onToggleLoop={onToggleLoop}
            textColor={textColor}
          />

          <ProgressSection
            textColor={textColor}
            pct={pct}
            position={position}
            duration={duration}
            onSeek={onSeek}
          />

          {/* Finished controls */}
          {!isPlaying && position > 0 && position >= duration - 500 && !loop ? (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                onPress={onReplay}
                style={{
                  backgroundColor: '#10b981',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>
                  Reproduzir novamente
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Download */}
          <View style={{ marginTop: 12 }}>
            <TouchableOpacity
              onPress={onDownload}
              disabled={downloading}
              style={{
                backgroundColor: downloading ? '#2563eb99' : '#2563eb',
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {downloading ? 'Salvando…' : 'Baixar áudio'}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={{ color: textColor }}>
          Áudio indisponível. Configure a chave de API para habilitar TTS.
        </Text>
      )}
    </View>
  )
}

async function ensureImage(
  summaryId: string,
  title: string | undefined,
  content: string,
): Promise<string | null> {
  try {
    const cachedImg = await localCache.get<string>(imageKey(summaryId))
    if (cachedImg?.data) return cachedImg.data
    const prompt = title || content.slice(0, 120)
    const uri = await aiService.generateSummaryImage(prompt)
    if (uri) await localCache.set(imageKey(summaryId), uri)
    return uri
  } catch {
    return null
  }
}

async function ensureAudio(
  summaryId: string,
  content: string,
): Promise<string | null> {
  try {
    const cachedAud = await localCache.get<string>(audioKey(summaryId))
    if (cachedAud?.data) return cachedAud.data
    const b64 = await aiService.ttsToBase64(content, 'mp3')
    if (!b64) return null
    const uri = await writeBase64ToCache(`summary_${summaryId}.mp3`, b64)
    await localCache.set(audioKey(summaryId), uri)
    return uri
  } catch {
    return null
  }
}

export default SummaryAudioScreen
