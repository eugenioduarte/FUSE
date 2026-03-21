#!/usr/bin/env bash

# Move UI components from ui/ folder to components/ root

set -e

COMP_DIR="/Users/eugeniosilva/Project/FUSE/src/components"

echo "📦 Moving UI components out of ui/ folder..."

# Move each component folder from ui/ to components/
for folder in card display-number snackbar snackbar-provider term-snippet-modal text-input ui-text; do
  if [ -d "$COMP_DIR/ui/$folder" ]; then
    echo "  → Moving ui/$folder to components/$folder"
    mv "$COMP_DIR/ui/$folder" "$COMP_DIR/$folder"
  fi
done

# Remove ui/index.ts
if [ -f "$COMP_DIR/ui/index.ts" ]; then
  echo "  → Removing ui/index.ts"
  rm "$COMP_DIR/ui/index.ts"
fi

# Remove empty ui/ folder
if [ -d "$COMP_DIR/ui" ]; then
  rmdir "$COMP_DIR/ui" 2>/dev/null || echo "  ⚠ ui/ folder not empty or already removed"
fi

echo ""
echo "✅ UI components moved to components root!"
