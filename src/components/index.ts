// Re-export all components from their organized category folders

// Buttons
export * from './buttons'

// Containers
export * from './containers'

// Headers
export * from './headers'

// Utility Components
export * from './utils'

// Step Dot
export * from './step-dot'

// UI Components (now at root level)
export { default as Card } from './card'
export { default as DisplayNumber } from './display-number'
export { default as Snackbar } from './snackbar'
export { SnackbarProvider } from './snackbar-provider'
export { default as TermSnippetModal } from './term-snippet-modal'
export { default as TextInput } from './text-input'
export { default as UiText } from './ui-text'

// Backward compatibility aliases
export { default as Text } from './ui-text/UiText'
