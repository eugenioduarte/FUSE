#!/usr/bin/env bash

# Script to fix all import issues after components reorganization

set -e

COMP_DIR="/Users/eugeniosilva/Project/FUSE/src/components"

echo "🔧 Fixing component import issues..."

# Fix 1: Add Text export to ui/index.ts
echo "  → Adding Text export to ui/index.ts"
cat > "$COMP_DIR/ui/index.ts" << 'EOF'
// Auto-generated index file for ui components

export { default as Card } from './card'
export { default as DisplayNumber } from './display-number'
export * from './snackbar-provider'
export { default as Snackbar } from './snackbar'
export { default as TermSnippetModal } from './term-snippet-modal'
export { default as TextInput } from './text-input'
export { default as UiText } from './ui-text'
export { default as Text } from './ui-text'  // Alias for backward compatibility
EOF

# Fix 2: Fix Header index.ts (it's a named export, not default)
echo "  → Fixing headers/header/index.ts"
cat > "$COMP_DIR/headers/header/index.ts" << 'EOF'
export { Header } from './Header'
EOF

# Fix 3: Fix HeaderDashboardMenuOverlay index.ts
echo "  → Fixing headers/header-dashboard-menu-overlay/index.ts"
cat > "$COMP_DIR/headers/header-dashboard-menu-overlay/index.ts" << 'EOF'
export { HeaderDashboardMenuOverlay } from './HeaderDashboardMenuOverlay'
EOF

# Fix 4: Fix SnackbarProvider index.ts
echo "  → Fixing ui/snackbar-provider/index.ts"
cat > "$COMP_DIR/ui/snackbar-provider/index.ts" << 'EOF'
export { SnackbarProvider } from './SnackbarProvider'
EOF

# Fix 5: Fix step-dot/index.ts (remove __tests__ import)
echo "  → Fixing step-dot/index.ts"
cat > "$COMP_DIR/step-dot/index.ts" << 'EOF'
export { default } from './StepDot'
EOF

# Fix 6: Fix Header.tsx internal imports
echo "  → Fixing headers/header/Header.tsx imports"
sed -i '' \
  -e "s|from './HeaderAddTopic'|from '../header-add-topic/HeaderAddTopic'|g" \
  -e "s|from './HeaderCalendar'|from '../header-calendar/HeaderCalendar'|g" \
  -e "s|from './HeaderChallengeAdd'|from '../header-challenge-add/HeaderChallengeAdd'|g" \
  -e "s|from './HeaderChallengesList'|from '../header-challenges-list/HeaderChallengesList'|g" \
  -e "s|from './HeaderDashboard'|from '../header-dashboard/HeaderDashboard'|g" \
  -e "s|from './HeaderSummaryAdd'|from '../header-summary-add/HeaderSummaryAdd'|g" \
  -e "s|from './HeaderSummaryDetails'|from '../header-summary-details/HeaderSummaryDetails'|g" \
  -e "s|from './HeaderTopicChat'|from '../header-topic-chat/HeaderTopicChat'|g" \
  -e "s|from './HeaderTopicDetails'|from '../header-topic-details/HeaderTopicDetails'|g" \
  -e "s|from './HeaderTopicList'|from '../header-topic-list/HeaderTopicList'|g" \
  "$COMP_DIR/headers/header/Header.tsx"

# Fix 7: Fix all header components that import IconButton or CloseButton
echo "  → Fixing header components relative imports"
find "$COMP_DIR/headers" -name "*.tsx" -type f | while read -r file; do
  sed -i '' \
    -e "s|from '../buttons/IconButton'|from '../../buttons/icon-button/IconButton'|g" \
    -e "s|from '../buttons/CloseButton'|from '../../buttons/close-button/CloseButton'|g" \
    "$file"
done

# Fix 8: Fix CloseButton import in buttons/close-button/CloseButton.tsx
echo "  → Fixing buttons/close-button/CloseButton.tsx"
sed -i '' "s|from './IconButton'|from '../icon-button/IconButton'|g" \
  "$COMP_DIR/buttons/close-button/CloseButton.tsx"

# Fix 9: Fix Button.tsx relative imports
echo "  → Fixing buttons/button/Button.tsx imports"
sed -i '' \
  -e "s|from '../../hooks/useTheme'|from '@/hooks/useTheme'|g" \
  -e "s|from '../ui/UiText'|from '@/components/ui/ui-text/UiText'|g" \
  "$COMP_DIR/buttons/button/Button.tsx"

# Fix 10: Fix other UI components relative imports
echo "  → Fixing ui components relatives imports"
sed -i '' "s|from './UiText'|from '../ui-text/UiText'|g" \
  "$COMP_DIR/ui/display-number/DisplayNumber.tsx"
  
sed -i '' "s|from './UiText'|from '../ui-text/UiText'|g" \
  "$COMP_DIR/ui/snackbar/Snackbar.tsx"
  
sed -i '' "s|from './Snackbar'|from '../snackbar/Snackbar'|g" \
  "$COMP_DIR/ui/snackbar-provider/SnackbarProvider.tsx"

# Fix 11: Fix UiText.tsx theme import
echo "  → Fixing ui/ui-text/UiText.tsx imports"
sed -i '' "s|from '../../constants/theme'|from '@/constants/theme'|g" \
  "$COMP_DIR/ui/ui-text/UiText.tsx"

# Fix 12: Fix TermSnippetModal imports
echo "  → Fixing ui/term-snippet-modal/TermSnippetModal.tsx"
sed -i '' \
  -e "s|from '../../types/domain'|from '@/types/domain'|g" \
  -e "s|from '../buttons/IconButton'|from '@/components/buttons/icon-button/IconButton'|g" \
  "$COMP_DIR/ui/term-snippet-modal/TermSnippetModal.tsx"

# Fix 13: Re-generate main components index with Text export
echo "  → Updating main components index.ts"
cat > "$COMP_DIR/index.ts" << 'EOF'
// Re-export all components from their organized category folders

// Buttons
export * from './buttons'

// Containers
export * from './containers'

// Headers
export * from './headers'

// UI Components
export * from './ui'

// Utility Components
export * from './utils'

// Step Dot
export * from './step-dot'

// Backward compatibility aliases
export { default as Text } from './ui/ui-text/UiText'
EOF

# Fix 14: Update header category index to include both named exports
echo "  → Updating headers/index.ts"
cat > "$COMP_DIR/headers/index.ts" << 'EOF'
// Auto-generated index file for headers components

export { default as HeaderAddTopic } from './header-add-topic'
export { default as HeaderCalendar } from './header-calendar'
export { default as HeaderChallengeAdd } from './header-challenge-add'
export { default as HeaderChallengesList } from './header-challenges-list'
export { default as HeaderCloseTitle } from './header-close-title'
export { HeaderDashboardMenuOverlay } from './header-dashboard-menu-overlay'
export { default as HeaderDashboard } from './header-dashboard'
export { default as HeaderSummaryAdd } from './header-summary-add'
export { default as HeaderSummaryDetails } from './header-summary-details'
export { default as HeaderTopicChat } from './header-topic-chat'
export { default as HeaderTopicDetails } from './header-topic-details'
export { default as HeaderTopicList } from './header-topic-list'
export { Header } from './header'
EOF

echo ""
echo "✅ All import issues fixed!"
echo "   Run 'npx tsc --noEmit' to verify."
