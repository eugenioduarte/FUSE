import { create } from 'zustand'

interface OverlayState {
  errorOverlay: boolean
  fastWayOverlay: boolean
  loadingOverlay: boolean
  errorMessage?: string
  setErrorOverlay: (visible: boolean, message?: string) => void
  setFastWayOverlay: (visible: boolean) => void
  setLoadingOverlay: (visible: boolean) => void
}

export const useOverlay = create<OverlayState>((set) => ({
  errorOverlay: false,
  fastWayOverlay: false,
  loadingOverlay: false,
  errorMessage: undefined,

  setErrorOverlay: (visible, message) =>
    set({ errorOverlay: visible, errorMessage: message }),
  setFastWayOverlay: (visible) => set({ fastWayOverlay: visible }),
  setLoadingOverlay: (visible) => set({ loadingOverlay: visible }),
}))
