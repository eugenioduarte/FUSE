#!/usr/bin/env bash

# Script to update all component imports to use new folder structure

set -e

PROJECT_ROOT="/Users/eugeniosilva/Project/FUSE"

echo "🔄 Updating component imports..."

# Function to convert PascalCase to kebab-case
to_kebab_case() {
  echo "$1" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]'
}

# Component mappings: old_path|new_path
mappings=(
  # Buttons
  "buttons/Button|buttons/button/Button"
  "buttons/CloseButton|buttons/close-button/CloseButton"
  "buttons/IconButton|buttons/icon-button/IconButton"
  "buttons/LinkButton|buttons/link-button/LinkButton"
  
  # Containers
  "containers/Container|containers/container/Container"
  "containers/EmptyContainer|containers/empty-container/EmptyContainer"
  "containers/LoadingContainer|containers/loading-container/LoadingContainer"
  "containers/PressableScale|containers/pressable-scale/PressableScale"
  "containers/SubContainer|containers/sub-container/SubContainer"
  
  # Headers
  "headers/Header|headers/header/Header"
  "headers/HeaderAddTopic|headers/header-add-topic/HeaderAddTopic"
  "headers/HeaderCalendar|headers/header-calendar/HeaderCalendar"
  "headers/HeaderChallengeAdd|headers/header-challenge-add/HeaderChallengeAdd"
  "headers/HeaderChallengesList|headers/header-challenges-list/HeaderChallengesList"
  "headers/HeaderCloseTitle|headers/header-close-title/HeaderCloseTitle"
  "headers/HeaderDashboard|headers/header-dashboard/HeaderDashboard"
  "headers/HeaderDashboardMenuOverlay|headers/header-dashboard-menu-overlay/HeaderDashboardMenuOverlay"
  "headers/HeaderSummaryAdd|headers/header-summary-add/HeaderSummaryAdd"
  "headers/HeaderSummaryDetails|headers/header-summary-details/HeaderSummaryDetails"
  "headers/HeaderTopicChat|headers/header-topic-chat/HeaderTopicChat"
  "headers/HeaderTopicDetails|headers/header-topic-details/HeaderTopicDetails"
  "headers/HeaderTopicList|headers/header-topic-list/HeaderTopicList"
  
  # UI
  "ui/Card|ui/card/Card"
  "ui/DisplayNumber|ui/display-number/DisplayNumber"
  "ui/Snackbar|ui/snackbar/Snackbar"
  "ui/SnackbarProvider|ui/snackbar-provider/SnackbarProvider"
  "ui/TermSnippetModal|ui/term-snippet-modal/TermSnippetModal"
  "ui/TextInput|ui/text-input/TextInput"
  "ui/UiText|ui/ui-text/UiText"
  
  # Utils
  "utils/ExpandableText|utils/expandable-text/ExpandableText"
  "utils/PdfTextExtractor|utils/pdf-text-extractor/PdfTextExtractor"
  
  # StepDot
  "stepDot/StepDot|step-dot/StepDot"
)

echo "  Found ${#mappings[@]} component mappings"

# Find all TypeScript/TSX files and update them
files_updated=0

find "$PROJECT_ROOT/src" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" | while read -r file; do
  file_modified=false
  
  for mapping in "${mappings[@]}"; do
    old_path="${mapping%%|*}"
    new_path="${mapping##*|}"
    
    # Check if file contains the old import pattern
    if grep -q "@/components/${old_path}" "$file" 2>/dev/null; then
      if [ "$file_modified" = false ]; then
        echo "    → Updating $file"
        file_modified=true
      fi
      
      # Use sed to replace the import path
      sed -i '' "s|@/components/${old_path}|@/components/${new_path}|g" "$file"
    fi
  done
  
  if [ "$file_modified" = true ]; then
    ((files_updated++))
  fi
done

echo ""
echo "✅ Component import paths updated!"
echo "   Check the changes and run tests to verify."

