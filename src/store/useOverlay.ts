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
  errorMessage?: string
  editOverlay: EditOverlayPayload | null
  setErrorOverlay: (visible: boolean, message?: string) => void
  setFastWayOverlay: (visible: boolean) => void
  setLoadingOverlay: (visible: boolean) => void
  setEditOverlay: (payload: EditOverlayPayload | null) => void
}

export const useOverlay = create<OverlayState>((set) => ({
  errorOverlay: false,
  fastWayOverlay: false,
  loadingOverlay: false,
  errorMessage: undefined,
  editOverlay: null,

  setErrorOverlay: (visible, message) =>
    set({ errorOverlay: visible, errorMessage: message }),
  setFastWayOverlay: (visible) => set({ fastWayOverlay: visible }),
  setLoadingOverlay: (visible) => set({ loadingOverlay: visible }),
  setEditOverlay: (payload) => set({ editOverlay: payload }),
}))
