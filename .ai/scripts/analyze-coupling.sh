#!/usr/bin/env bash
# Example script to trigger Coupling Analyzer agent
# Usage: ./analyze-coupling.sh [full|feature:<name>|file:<path>|pr:<number>]

set -e

MODE="${1:-full}"

echo "🔗 Coupling Analyzer"
echo "===================="
echo ""
echo "Mode: $MODE"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Create analysis directory if not exists
mkdir -p .ai/analysis

# Step 1: Build Dependency Graph
echo "📊 Building dependency graph..."
if command -v npx &> /dev/null; then
  npx madge --json src/ > .ai/analysis/dependency-graph.json 2>/dev/null || echo "  (madge not available, skipping)"
  
  echo "  Checking for circular dependencies..."
  CIRCULAR=$(npx madge --circular --extensions ts,tsx src/ 2>/dev/null || echo "none")
  echo "$CIRCULAR" > .ai/analysis/circular-deps.txt
  
  if [ "$CIRCULAR" != "none" ] && [ ! -z "$CIRCULAR" ]; then
    echo "  ⚠️  Found circular dependencies!"
    echo "$CIRCULAR"
  else
    echo "  ✅ No circular dependencies found"
  fi
else
  echo "  ⚠️  madge not installed, skipping dependency graph"
fi
echo ""

# Step 2: Analyze Git History
echo "📈 Analyzing git history (last 3 months)..."
git log --format='' --name-only --since='3 months ago' \
  | grep 'src/' \
  | sort \
  | uniq -c \
  | sort -rn \
  | head -20 > .ai/analysis/change-frequency.txt

echo "  Top 10 most changed files:"
head -10 .ai/analysis/change-frequency.txt | while read count file; do
  echo "    $count changes - $file"
done
echo ""

# Step 3: Calculate Coupling Metrics
echo "🔢 Calculating coupling metrics..."

# Count imports per file (Fan-Out)
echo "  Analyzing fan-out (dependencies per file)..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  imports=$(grep -c "^import" "$file" 2>/dev/null || echo "0")
  echo "$imports,$file"
done | sort -rn | head -10 > .ai/analysis/high-fanout.csv

echo "  Top 5 files with highest fan-out:"
head -5 .ai/analysis/high-fanout.csv | while IFS=',' read fanout file; do
  echo "    $fanout imports - $file"
done
echo ""

# Step 4: Detect Layer Violations
echo "🚨 Detecting architectural violations..."

echo "  Checking for Screen → Service coupling..."
SCREEN_SERVICE=$(grep -r "from '@/services" src/screens/ 2>/dev/null | wc -l || echo "0")
if [ "$SCREEN_SERVICE" -gt 0 ]; then
  echo "  ⚠️  Found $SCREEN_SERVICE violations: Screens importing Services directly"
  grep -r "from '@/services" src/screens/ 2>/dev/null | head -5
else
  echo "  ✅ No Screen → Service violations"
fi
echo ""

echo "  Checking for reverse violations (Service → UI)..."
SERVICE_UI=$(grep -r "from '@/screens\|from '@/components" src/services/ 2>/dev/null | wc -l || echo "0")
if [ "$SERVICE_UI" -gt 0 ]; then
  echo "  ⚠️  Found $SERVICE_UI violations: Services importing UI"
  grep -r "from '@/screens\|from '@/components" src/services/ 2>/dev/null | head -5
else
  echo "  ✅ No Service → UI violations"
fi
echo ""

# Step 5: Find God Objects
echo "👑 Detecting god objects..."

# Find files imported by many others
echo "  Analyzing fan-in (files imported by many)..."
find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) -exec basename {} \; | sort | uniq | while read filename; do
  count=$(grep -r "from.*/$filename" src/ 2>/dev/null | wc -l || echo "0")
  if [ "$count" -gt 10 ]; then
    echo "$count,$filename"
  fi
done | sort -rn | head -5 > .ai/analysis/high-fanin.csv

if [ -s .ai/analysis/high-fanin.csv ]; then
  echo "  ⚠️  Potential god objects detected:"
  cat .ai/analysis/high-fanin.csv | while IFS=',' read fanin file; do
    echo "    $fanin imports - $file"
  done
else
  echo "  ✅ No god objects detected"
fi
echo ""

# Step 6: Calculate Health Score
echo "💯 Calculating health score..."

TOTAL_FILES=$(find src/ -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l)
AVG_FANOUT=$(awk -F',' '{sum+=$1} END {print sum/NR}' .ai/analysis/high-fanout.csv 2>/dev/null || echo "0")
CIRCULAR_COUNT=$(grep -c "Circular" .ai/analysis/circular-deps.txt 2>/dev/null || echo "0")
VIOLATIONS=$((SCREEN_SERVICE + SERVICE_UI))

# Simple health score calculation
SCORE=100
[ "$AVG_FANOUT" -gt 10 ] && SCORE=$((SCORE - 20))
[ "$CIRCULAR_COUNT" -gt 0 ] && SCORE=$((SCORE - 30))
[ "$VIOLATIONS" -gt 0 ] && SCORE=$((SCORE - ((VIOLATIONS > 10 ? 10 : VIOLATIONS) * 2)))

echo ""
echo "============================================================"
echo "📊 Coupling Analysis Report"
echo "============================================================"
echo ""
echo "Total Files Analyzed: $TOTAL_FILES"
echo "Average Fan-Out: $(printf "%.1f" "$AVG_FANOUT")"
echo "Circular Dependencies: $CIRCULAR_COUNT"
echo "Architectural Violations: $VIOLATIONS"
echo ""
echo "Health Score: $SCORE/100"
if [ "$SCORE" -ge 80 ]; then
  echo "Status: ✅ Healthy"
elif [ "$SCORE" -ge 60 ]; then
  echo "Status: ⚠️  Needs Improvement"
else
  echo "Status: 🚨 Critical"
fi
echo ""
echo "============================================================"
echo ""

# Step 7: Generate Report
REPORT_FILE=".ai/analysis/coupling-report-$(date +%Y%m%d-%H%M%S).md"

cat > "$REPORT_FILE" << EOF
# Coupling Analysis Report

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')  
**Mode:** $MODE  
**Analyzer:** coupling-analyzer  
**Model:** claude-sonnet-4-6

---

## Executive Summary

- **Total Files Analyzed:** $TOTAL_FILES
- **Average Fan-Out:** $(printf "%.1f" "$AVG_FANOUT")
- **Circular Dependencies:** $CIRCULAR_COUNT
- **Architectural Violations:** $VIOLATIONS
- **Health Score:** $SCORE/100

$(if [ "$SCORE" -ge 80 ]; then echo "**Status:** ✅ Healthy"; elif [ "$SCORE" -ge 60 ]; then echo "**Status:** ⚠️  Needs Improvement"; else echo "**Status:** 🚨 Critical"; fi)

---

## Critical Issues

$(if [ "$CIRCULAR_COUNT" -gt 0 ]; then echo "### 🚨 Circular Dependencies Detected"; echo ""; echo "\`\`\`"; cat .ai/analysis/circular-deps.txt; echo "\`\`\`"; echo ""; fi)

$(if [ "$VIOLATIONS" -gt 0 ]; then echo "### 🚨 Architectural Violations"; echo ""; echo "**Screen → Service Violations:** $SCREEN_SERVICE"; echo ""; echo "These screens bypass the hook layer and import services directly:"; echo ""; echo "\`\`\`"; grep -r "from '@/services" src/screens/ 2>/dev/null | head -10; echo "\`\`\`"; echo ""; fi)

---

## High Coupling Files

### High Fan-Out (Most Dependencies)

\`\`\`
$(head -10 .ai/analysis/high-fanout.csv)
\`\`\`

$(if [ -s .ai/analysis/high-fanin.csv ]; then echo "### High Fan-In (Most Dependents - God Objects)"; echo ""; echo "\`\`\`"; cat .ai/analysis/high-fanin.csv; echo "\`\`\`"; echo ""; fi)

---

## Change Frequency Hotspots

Files most frequently modified (last 3 months):

\`\`\`
$(head -10 .ai/analysis/change-frequency.txt)
\`\`\`

---

## Recommendations

### Priority 1: Critical
$(if [ "$CIRCULAR_COUNT" -gt 0 ]; then echo "- 🚨 **Fix circular dependencies immediately** - These break modularity"; fi)
$(if [ "$SCREEN_SERVICE" -gt 0 ]; then echo "- 🚨 **Remove Screen → Service coupling** - Use hook layer as intermediary"; fi)

### Priority 2: High
$(if [ -s .ai/analysis/high-fanin.csv ]; then echo "- ⚠️  **Split god objects** - Files with excessive fan-in should be split by domain"; fi)
- ⚠️  **Extract common patterns** - Identify reusable abstractions

### Priority 3: Medium
- 📊 **Monitor change patterns** - Files changed together may benefit from co-location
- 🔄 **Reduce fan-out** - Files with > 10 imports need dependency review

---

## Action Items

- [ ] Fix circular dependencies
- [ ] Refactor Screen → Service violations
- [ ] Split god objects (high fan-in files)
- [ ] Review high fan-out files
- [ ] Extract common patterns from hotspots

---

## Metrics Tracking

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Avg Fan-Out | $(printf "%.1f" "$AVG_FANOUT") | < 7 | $(if awk "BEGIN {exit !($AVG_FANOUT < 7)}"; then echo "✅"; else echo "⚠️"; fi) |
| Circular Deps | $CIRCULAR_COUNT | 0 | $(if [ "$CIRCULAR_COUNT" -eq 0 ]; then echo "✅"; else echo "🚨"; fi) |
| Violations | $VIOLATIONS | 0 | $(if [ "$VIOLATIONS" -eq 0 ]; then echo "✅"; else echo "🚨"; fi) |
| Health Score | $SCORE | > 80 | $(if [ "$SCORE" -ge 80 ]; then echo "✅"; else echo "⚠️"; fi) |

---

*Report generated by Coupling Analyzer Agent*
EOF

echo "📄 Report saved to: $REPORT_FILE"
echo ""

# Step 8: Log to CSV
CSV_FILE=".ai/analysis/coupling-history.csv"

# Create CSV header if not exists
if [ ! -f "$CSV_FILE" ]; then
  echo "date,total_files,avg_fanout,circular_deps,violations,health_score,model_used" > "$CSV_FILE"
fi

echo "$(date '+%Y-%m-%d %H:%M:%S'),$TOTAL_FILES,$AVG_FANOUT,$CIRCULAR_COUNT,$VIOLATIONS,$SCORE,claude-sonnet-4-6" >> "$CSV_FILE"

echo "📊 Metrics logged to: $CSV_FILE"
echo ""

# Step 9: Open report
echo "🎉 Analysis Complete!"
echo ""
echo "Review the full report:"
echo "  cat $REPORT_FILE"
echo ""
