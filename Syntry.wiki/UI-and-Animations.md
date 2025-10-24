# UI and Animations

## Transitions

- Header transitions use Reanimated entering/exiting with smooth cubic easing (no bounce): old header slides down while the new one slides up.

## Loading overlays

- A shared Loading Overlay displays the current loading state.
- It supports a dynamic `loadingMessage` (e.g., “Sincronizando…”) for short, capped-time flushes.

## Theming

- Topic background color propagates to summaries and some screens.
- Colors are derived from Topic metadata and applied consistently.

## Components

- UI components live under `src/components` and `src/screens/*/utils`.
- Prefer small, composable pieces with predictable props.
