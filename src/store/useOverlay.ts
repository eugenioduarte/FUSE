import { create } from 'zustand'

type EditOverlayPayload =
  | {
      type: 'topic'
      topic: import('../types/domain').Topic
      onSaved?: (t: import('../types/domain').Topic) => void
    }
  | {
      type: 'summary'
      summary: import('../types/domain').Summary
      onSaved?: (s: import('../types/domain').Summary) => void
    }

interface OverlayState {
  errorOverlay: boolean
  fastWayOverlay: boolean
  loadingOverlay: boolean
  loadingMessage?: string
  errorMessage?: string
  successOverlay: boolean
  successMessage?: string
  editOverlay: EditOverlayPayload | null
  setErrorOverlay: (visible: boolean, message?: string) => void
  setFastWayOverlay: (visible: boolean) => void
  setLoadingOverlay: (visible: boolean, message?: string) => void
  setSuccessOverlay: (visible: boolean, message?: string) => void
  setEditOverlay: (payload: EditOverlayPayload | null) => void
}

export const useOverlay = create<OverlayState>((set) => ({
  errorOverlay: false,
  fastWayOverlay: false,
  loadingOverlay: false,
  loadingMessage: undefined,
  errorMessage: undefined,
  successOverlay: false,
  successMessage: undefined,
  editOverlay: null,

  setErrorOverlay: (visible, message) =>
    set({ errorOverlay: visible, errorMessage: message }),
  setFastWayOverlay: (visible) => set({ fastWayOverlay: visible }),
  setLoadingOverlay: (visible, message) =>
    set({ loadingOverlay: visible, loadingMessage: message }),
  setSuccessOverlay: (visible, message) =>
    set({ successOverlay: visible, successMessage: message }),
  setEditOverlay: (payload) => set({ editOverlay: payload }),
}))
