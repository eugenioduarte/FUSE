#!/bin/bash

# Script to reorganize components into kebab-case folder structure
# Each component gets its own folder with:
# - Component file (PascalCase.tsx)
# - __tests__/ folder
# - index.ts for re-export

set -e

COMPONENTS_DIR="/Users/eugeniosilva/Project/FUSE/src/components"

echo "🔄 Reorganizing components structure..."

# Function to convert PascalCase to kebab-case
to_kebab_case() {
  echo "$1" | sed 's/\([A-Z]\)/-\1/g' | sed 's/^-//' | tr '[:upper:]' '[:lower:]'
}

# Function to reorganize a component
reorganize_component() {
  local file_path="$1"
  local category="$2"
  
  # Get component name without extension
  local component_name=$(basename "$file_path" .tsx)
  
  # Skip if it's already index.ts
  if [ "$component_name" == "index" ]; then
    return
  fi
  
  # Convert to kebab-case for folder name
  local folder_name=$(to_kebab_case "$component_name")
  
  # Create new folder structure
  local new_dir="$COMPONENTS_DIR/$category/$folder_name"
  
  echo "  → Moving $component_name to $category/$folder_name/"
  
  # Create directory and __tests__ subfolder
  mkdir -p "$new_dir/__tests__"
  
  # Move the component file
  mv "$file_path" "$new_dir/$component_name.tsx"
  
  # Create index.ts for re-export
  cat > "$new_dir/index.ts" << EOF
export { default } from './$component_name'
EOF
  
  # Create test stub
  cat > "$new_dir/__tests__/$component_name.test.tsx" << EOF
import React from 'react'
import { render } from '@testing-library/react-native'
import $component_name from '../$component_name'

describe('$component_name', () => {
  it('should render without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
EOF
}

# Process each category
for category in buttons containers headers ui utils; do
  echo ""
  echo "📦 Processing $category/..."
  
  # Find all .tsx files in the category (not in subdirectories)
  if [ -d "$COMPONENTS_DIR/$category" ]; then
    for file in "$COMPONENTS_DIR/$category"/*.tsx; do
      if [ -f "$file" ]; then
        reorganize_component "$file" "$category"
      fi
    done
  fi
done

# Special case: stepDot is already a folder with one component
if [ -d "$COMPONENTS_DIR/stepDot" ]; then
  echo ""
  echo "📦 Processing stepDot/..."
  
  # Rename folder to kebab-case
  mv "$COMPONENTS_DIR/stepDot" "$COMPONENTS_DIR/step-dot"
  
  # Create test if it doesn't exist
  if [ ! -d "$COMPONENTS_DIR/step-dot/__tests__" ]; then
    mkdir -p "$COMPONENTS_DIR/step-dot/__tests__"
    cat > "$COMPONENTS_DIR/step-dot/__tests__/StepDot.test.tsx" << EOF
import React from 'react'
import { render } from '@testing-library/react-native'
import StepDot from '../StepDot'

describe('StepDot', () => {
  it('should render without crashing', () => {
    // TODO: Implement actual test
    expect(true).toBe(true)
  })
})
EOF
  fi
  
  # Create index.ts if it doesn't exist
  if [ ! -f "$COMPONENTS_DIR/step-dot/index.ts" ]; then
    cat > "$COMPONENTS_DIR/step-dot/index.ts" << EOF
export { default } from './StepDot'
EOF
  fi
fi

echo ""
echo "✅ Components reorganization complete!"
echo ""
echo "Next steps:"
echo "  1. Update all imports across the codebase"
echo "  2. Run tests to verify nothing broke"
echo "  3. Implement proper tests for each component"
