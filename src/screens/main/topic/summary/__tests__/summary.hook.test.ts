import useSummaryScreen from '../summary.hook'
import { renderHook } from '@testing-library/react-native'

jest.mock('@/locales/translation', () => ({ t: (k: string) => k }))
jest.mock('@/navigation/navigatorManager', () => ({ navigatorManager: { navigate: jest.fn() } }))
jest.mock('@/services/repositories/summaries.repository', () => ({
  summariesRepository: { create: jest.fn(), getAll: jest.fn().mockResolvedValue([]) },
}))
jest.mock('@/store/overlay.store', () => ({
  useOverlay: () => ({ setLoadingOverlay: jest.fn(), setErrorOverlay: jest.fn() }),
}))
jest.mock('expo-document-picker', () => ({ getDocumentAsync: jest.fn() }))
jest.mock('expo-file-system/legacy', () => ({ readAsStringAsync: jest.fn() }))
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({ params: { topicId: 'topic-1' } }),
}))

describe('useSummaryScreen', () => {
  it('returns prompt state and handlers', () => {
    const { result } = renderHook(() => useSummaryScreen())
    expect(typeof result.current.prompt).toBe('string')
    expect(typeof result.current.setPrompt).toBe('function')
    expect(typeof result.current.handleGenerate).toBe('function')
  })
})
