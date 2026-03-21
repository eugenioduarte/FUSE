#!/usr/bin/env bash

# Update all references from Syntry to Fuse in wiki files and other documentation

set -e

PROJ="/Users/eugeniosilva/Project/FUSE"

echo "🔄 Updating all Syntry references to Fuse..."

# Update all files in FUSE.wiki folder
echo "  → Updating FUSE.wiki files"
find "$PROJ/FUSE.wiki" -type f -name "*.md" | while read -r file; do
  sed -i '' \
    -e "s/Syntry/Fuse/g" \
    -e "s/syntry/fuse/g" \
    "$file"
  echo "    ✓ Updated $(basename "$file")"
done

# Update README.md
echo "  → Updating README.md"
sed -i '' \
  -e "s/Syntry\.wiki/FUSE.wiki/g" \
  -e "s/Syntry/Fuse/g" \
  "$PROJ/README.md"

# Update .ai files
echo "  → Updating .ai files"
find "$PROJ/.ai" -type f -name "*.md" | while read -r file; do
  if grep -q "Syntry" "$file" 2>/dev/null; then
    sed -i '' \
      -e "s/Syntry\.wiki/FUSE.wiki/g" \
      -e "s/Syntry/Fuse/g" \
      "$file"
    echo "    ✓ Updated $(basename "$file")"
  fi
done

echo ""
echo "✅ All Syntry references updated to Fuse!"
