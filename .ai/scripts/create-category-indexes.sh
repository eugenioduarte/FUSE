#!/bin/bash

# Script to create category index.ts files and update main components index

set -e

COMPONENTS_DIR="/Users/eugeniosilva/Project/FUSE/src/components"

echo "📝 Creating category index.ts files..."

# Function to create index.ts for a category
create_category_index() {
  local category="$1"
  local index_file="$COMPONENTS_DIR/$category/index.ts"
  
  echo "export * from './button'"
  
  echo "  → Creating $category/index.ts"
  
  # Start the index file
  echo "// Auto-generated index file for $category components" > "$index_file"
  echo "" >> "$index_file"
  
  # Find all subdirectories (each is a component)
  for dir in "$COMPONENTS_DIR/$category"/*/; do
    if [ -d "$dir" ]; then
      local component_folder=$(basename "$dir")
      
      # Read the component file to get the export name
      local tsx_file=$(find "$dir" -maxdepth 1 -name "*.tsx" | head -1)
      
      if [ -f "$tsx_file" ]; then
        local component_name=$(basename "$tsx_file" .tsx)
        
        # Check if it's a default export or named export
        if grep -q "export default" "$tsx_file"; then
          echo "export { default as $component_name } from './$component_folder'" >> "$index_file"
        else
          # For named exports, re-export all
          echo "export * from './$component_folder'" >> "$index_file"
        fi
      fi
    fi
  done
  
  echo "    ✓ Created with $(grep -c "export" "$index_file" || echo 0) exports"
}

# Create index.ts for each category
for category in buttons containers headers ui utils step-dot; do
  create_category_index "$category"
done

echo ""
echo "✅ Category index files created!"
