import { useOverlay } from '@/store/overlay.store'

type ReportOptions = {
  message?: string
  context?: any
}

/**
 * Centralized error reporter.
 * - Logs to console
 * - Shows the app error snackbar using overlay store
 * - Placeholder: send to crash-analytics / remote logging in the future
 */
export function reportError(err: unknown, opts?: ReportOptions) {
  try {
    // Always log locally for dev/debug
    console.error('[reportError]', opts?.context ?? '', err)
  } catch {}

  try {
    const setter = useOverlay.getState().setErrorOverlay
    if (typeof setter === 'function') {
      setter(true, opts?.message ?? 'Ocorreu um erro')
    }
  } catch (e) {
    // swallow any error from overlay to avoid cascading failures
    console.error('[reportError] failed to show error overlay', e)
  }

  // Placeholder for future crash-analytics integration (Sentry / Crashlytics)
  // Example: send minimal payload to remote logger without blocking UI
  // sendToCrashService({ error: err, context: opts?.context })
}

export default reportError
