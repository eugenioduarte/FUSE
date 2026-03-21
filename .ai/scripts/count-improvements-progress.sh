#!/usr/bin/env bash
# Script to count and display progress of future improvements
# Usage: ./count-improvements-progress.sh

FILE=".ai/_sdd/future-improvements.md"

if [ ! -f "$FILE" ]; then
  echo "❌ Future improvements file not found"
  exit 1
fi

echo "📊 Future Improvements Progress Tracker"
echo "════════════════════════════════════════════════════════════"
echo ""

# Count overall task checkboxes in Quick Status section
TOTAL_TASKS=$(grep -A 15 "### Quick Status" "$FILE" | grep -c "Task #")
COMPLETED_TASKS=$(grep -A 15 "### Quick Status" "$FILE" | grep -c "\[x\].*Task #")
PENDING_TASKS=$((TOTAL_TASKS - COMPLETED_TASKS))

# Calculate percentage
if [ $TOTAL_TASKS -gt 0 ]; then
  PERCENTAGE=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))
else
  PERCENTAGE=0
fi

# Progress bar
BAR_LENGTH=50
FILLED=$((PERCENTAGE * BAR_LENGTH / 100))
EMPTY=$((BAR_LENGTH - FILLED))
PROGRESS_BAR=$(printf "█%.0s" $(seq 1 $FILLED))$(printf "░%.0s" $(seq 1 $EMPTY))

echo "📈 Overall Progress"
echo ""
echo "  Total Tasks:      $TOTAL_TASKS"
echo "  Completed:        $COMPLETED_TASKS ✅"
echo "  Pending:          $PENDING_TASKS 📋"
echo "  Completion:       $PERCENTAGE%"
echo ""
echo "  [$PROGRESS_BAR] $PERCENTAGE%"
echo ""

# Count task-specific checkboxes for each improvement
echo "📋 Detailed Task Progress"
echo "────────────────────────────────────────────────────────────"
echo ""

# Function to count checkboxes for a specific task
count_task_checkboxes() {
  local task_num=$1
  local start_pattern="## $task_num\\."
  local end_pattern="^## [0-9]"
  
  # Extract section for this task - more reliable approach
  local section=$(sed -n "/^$start_pattern/,/^$end_pattern/p" "$FILE" | sed '$d')
  
  if [ -z "$section" ]; then
    # If no end pattern found, get until end of file
    section=$(sed -n "/^$start_pattern/,\$p" "$FILE")
  fi
  
  local total=$(echo "$section" | grep -c "^- \[.\]")
  local checked=$(echo "$section" | grep -c "^- \[x\]")
  local unchecked=$((total - checked))
  
  if [ $total -gt 0 ]; then
    local pct=$((checked * 100 / total))
    echo "$total|$checked|$unchecked|$pct"
  else
    echo "0|0|0|0"
  fi
}

# Iterate through tasks
for i in {1..10}; do
  TASK_NAME=$(grep "^## $i\." "$FILE" | head -1 | sed "s/^## $i\. //" | sed 's/ ✅$//')
  
  if [ ! -z "$TASK_NAME" ]; then
    # Get task info
    INFO=$(count_task_checkboxes "$i")
    IFS='|' read -r TOTAL CHECKED UNCHECKED PCT <<< "$INFO"
    
    # Get task status
    STATUS=$(grep -A 2 "^## $i\." "$FILE" | grep "Status:" | sed 's/.*Status:\*\* //' | sed 's/\*\*.*//' | xargs)
    
    if [ -z "$STATUS" ]; then
      STATUS=$(grep -A 2 "^## $i\." "$FILE" | grep "Status:" | sed 's/.*Status: //' | xargs)
    fi
    
    # Format output
    if [ $TOTAL -gt 0 ]; then
      printf "Task #%d: %s\n" "$i" "$TASK_NAME"
      printf "  Status: %s\n" "$STATUS"
      printf "  Sub-tasks: %d total | %d ✅ | %d pending | %d%%\n" "$TOTAL" "$CHECKED" "$UNCHECKED" "$PCT"
      
      # Mini progress bar
      MINI_BAR_LENGTH=20
      MINI_FILLED=$((PCT * MINI_BAR_LENGTH / 100))
      if [ $MINI_FILLED -gt 0 ]; then
        MINI_EMPTY=$((MINI_BAR_LENGTH - MINI_FILLED))
        MINI_BAR=$(printf "█%.0s" $(seq 1 $MINI_FILLED))$(printf "░%.0s" $(seq 1 $MINI_EMPTY))
      else
        MINI_BAR=$(printf "░%.0s" $(seq 1 $MINI_BAR_LENGTH))
      fi
      printf "  [%s] %d%%\n" "$MINI_BAR" "$PCT"
      echo ""
    else
      printf "Task #%d: %s\n" "$i" "$TASK_NAME"
      printf "  Status: %s\n" "$STATUS"
      printf "  No sub-tasks defined\n"
      echo ""
    fi
  fi
done

echo "════════════════════════════════════════════════════════════"
echo ""
echo "💡 Tip: Mark checkboxes with [x] in $FILE"
echo "    to update progress automatically"
echo ""
