#!/usr/bin/env bash

# Update all imports after moving UI components

set -e

PROJ="/Users/eugeniosilva/Project/FUSE"
COMP_DIR="$PROJ/src/components"

echo "🔄 Updating imports after UI folder removal..."

# Update components/index.ts
echo "  → Updating components/index.ts"
cat > "$COMP_DIR/index.ts" << 'EOF'
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
export { SnackbarProvider } from './snackbar-provider'
export { default as Snackbar } from './snackbar'
export { default as TermSnippetModal } from './term-snippet-modal'
export { default as TextInput } from './text-input'
export { default as UiText } from './ui-text'

// Backward compatibility aliases
export { default as Text } from './ui-text/UiText'
EOF

# Update all imports: @/components/ui/* → @/components/*
echo "  → Updating imports from @/components/ui/* to @/components/*"

find "$PROJ/src" "$PROJ/App.tsx" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" 2>/dev/null | while read -r file; do
  if grep -q "@/components/ui/" "$file" 2>/dev/null; then
    sed -i '' \
      -e "s|@/components/ui/card/Card|@/components/card/Card|g" \
      -e "s|@/components/ui/display-number/DisplayNumber|@/components/display-number/DisplayNumber|g" \
      -e "s|@/components/ui/snackbar/Snackbar|@/components/snackbar/Snackbar|g" \
      -e "s|@/components/ui/snackbar-provider/SnackbarProvider|@/components/snackbar-provider/SnackbarProvider|g" \
      -e "s|@/components/ui/term-snippet-modal/TermSnippetModal|@/components/term-snippet-modal/TermSnippetModal|g" \
      -e "s|@/components/ui/text-input/TextInput|@/components/text-input/TextInput|g" \
      -e "s|@/components/ui/ui-text/UiText|@/components/ui-text/UiText|g" \
      "$file"
  fi
done

# Fix internal relative imports in moved components
echo "  → Fixing internal relative imports"

# Fix display-number/DisplayNumber.tsx
if [ -f "$COMP_DIR/display-number/DisplayNumber.tsx" ]; then
  sed -i '' "s|from '../ui-text/UiText'|from '@/components/ui-text/UiText'|g" \
    "$COMP_DIR/display-number/DisplayNumber.tsx"
fi

# Fix snackbar/Snackbar.tsx
if [ -f "$COMP_DIR/snackbar/Snackbar.tsx" ]; then
  sed -i '' "s|from '../ui-text/UiText'|from '@/components/ui-text/UiText'|g" \
    "$COMP_DIR/snackbar/Snackbar.tsx"
fi

# Fix snackbar-provider/SnackbarProvider.tsx
if [ -f "$COMP_DIR/snackbar-provider/SnackbarProvider.tsx" ]; then
  sed -i '' "s|from '../snackbar/Snackbar'|from '@/components/snackbar/Snackbar'|g" \
    "$COMP_DIR/snackbar-provider/SnackbarProvider.tsx"
fi

# Fix term-snippet-modal/TermSnippetModal.tsx
if [ -f "$COMP_DIR/term-snippet-modal/TermSnippetModal.tsx" ]; then
  sed -i '' "s|from '@/components/buttons/icon-button/IconButton'|from '@/components/buttons/icon-button/IconButton'|g" \
    "$COMP_DIR/term-snippet-modal/TermSnippetModal.tsx"
fi

echo ""
echo "✅ All imports updated!"
echo "   Run 'npx tsc --noEmit' to verify."
