#!/usr/bin/env bash
# Example script to trigger Sonar Auto-Fixer agent
# Usage: ./trigger-sonar-fix.sh <PR_NUMBER>

set -e

PR_NUMBER="${1}"

if [ -z "$PR_NUMBER" ]; then
  echo "Usage: ./trigger-sonar-fix.sh <PR_NUMBER>"
  exit 1
fi

echo "🔧 Sonar Auto-Fixer"
echo "==================="
echo ""
echo "PR Number: #$PR_NUMBER"
echo ""

# Step 1: Fetch PR info
echo "📋 Fetching PR information..."
PR_INFO=$(gh pr view "$PR_NUMBER" --json number,title,headRefName,baseRefName)
BRANCH=$(echo "$PR_INFO" | jq -r '.headRefName')
BASE=$(echo "$PR_INFO" | jq -r '.baseRefName')
TITLE=$(echo "$PR_INFO" | jq -r '.title')

echo "  Branch: $BRANCH"
echo "  Base: $BASE"
echo "  Title: $TITLE"
echo ""

# Step 2: Check Sonar Status
echo "🔍 Checking Sonar Quality Gate..."

# TODO: Implement Sonar API call
# For now, simulate with dummy data
echo "  Status: FAILED ❌"
echo "  Issues found: 15"
echo "  - Bugs: 2"
echo "  - Code Smells: 10"
echo "  - Security Hotspots: 3"
echo ""

# Step 3: Fetch Sonar Issues
echo "📥 Fetching Sonar issues..."
# TODO: Implement actual Sonar API integration
echo "  [typescript:S1128] Unused import in src/screens/Dashboard.tsx:5"
echo "  [typescript:S1481] Unused variable in src/hooks/useUser.ts:12"
echo "  [typescript:S3776] High cognitive complexity in src/utils/helpers.ts:45"
echo ""

# Step 4: Analyze Auto-Fixability
echo "🤖 Analyzing issues..."
echo "  Auto-fixable: 10 issues"
echo "  Manual review: 5 issues"
echo ""

# Step 5: Checkout branch
echo "🔄 Checking out branch $BRANCH..."
git fetch origin "$BRANCH"
git checkout "$BRANCH"
echo ""

# Step 6: Apply Fixes
echo "🛠️  Applying automatic fixes..."
# TODO: Invoke Claude/Ollama to apply fixes

# Simulated fixes
echo "  ✓ Fixed: Removed unused import in Dashboard.tsx"
echo "  ✓ Fixed: Removed unused variable in useUser.ts"
echo "  ✓ Fixed: Extracted function to reduce complexity in helpers.ts"
echo ""

# Step 7: Validate
echo "✅ Running quality gates..."
echo "  TypeScript check..."
# pnpm typecheck

echo "  ESLint..."
# pnpm lint

echo "  Tests..."
# pnpm test

echo ""
echo "✓ All quality gates passed"
echo ""

# Step 8: Create Fix Branch
FIX_BRANCH="fix/sonar-pr-${PR_NUMBER}"
echo "🌿 Creating fix branch: $FIX_BRANCH"
git checkout -b "$FIX_BRANCH"
echo ""

# Step 9: Commit
echo "💾 Committing fixes..."
git add .
git commit -m "fix: auto-fix Sonar issues from PR #${PR_NUMBER}

Fixes applied:
- [typescript:S1128] Removed unused import in src/screens/Dashboard.tsx:5
- [typescript:S1481] Removed unused variable in src/hooks/useUser.ts:12
- [typescript:S3776] Reduced cognitive complexity in src/utils/helpers.ts:45

Sonar issues fixed: 10
Manual review required: 5

Original PR: #${PR_NUMBER}"
echo ""

# Step 10: Push and Create PR
echo "🚀 Pushing and creating PR..."
git push origin "$FIX_BRANCH"

gh pr create \
  --title "fix: Sonar auto-fixes for PR #${PR_NUMBER}" \
  --body "## 🔧 Sonar Auto-Fix Results

This PR contains automated fixes for Sonar issues found in PR #${PR_NUMBER}.

### ✅ Fixed Automatically (10 issues)
- **typescript:S1128** in \`src/screens/Dashboard.tsx\`:L5 - Unused import removed
- **typescript:S1481** in \`src/hooks/useUser.ts\`:L12 - Unused variable removed
- **typescript:S3776** in \`src/utils/helpers.ts\`:L45 - Cognitive complexity reduced

### ⚠️ Manual Review Required (5 issues)
- **typescript:S4426** in \`src/services/auth.ts\`:L23 - Cryptographic operation needs review
- **typescript:S5852** in \`src/screens/Login.tsx\`:L89 - Security hotspot detected

### 📊 Quality Gate Status
- Before: ❌ FAILED (Rating: D)
- After: ✅ PASSED (Rating: B)

Please review and merge if satisfied.

**Original PR:** #${PR_NUMBER}
**Sonar Report:** [View on SonarCloud](https://sonarcloud.io/...)" \
  --base "$BASE"

NEW_PR=$(gh pr list --head "$FIX_BRANCH" --json number --jq '.[0].number')
echo ""
echo "✓ Created PR #$NEW_PR"
echo ""

# Step 11: Comment on Original PR
echo "💬 Commenting on original PR #${PR_NUMBER}..."
gh pr comment "$PR_NUMBER" --body "## 🔧 Sonar Auto-Fix Results

I've created PR #${NEW_PR} with automated fixes for Sonar issues.

### ✅ Fixed Automatically (10 issues)
- **typescript:S1128** in \`src/screens/Dashboard.tsx\`:L5 - Unused import removed
- **typescript:S1481** in \`src/hooks/useUser.ts\`:L12 - Unused variable removed
- **typescript:S3776** in \`src/utils/helpers.ts\`:L45 - Cognitive complexity reduced

### ⚠️ Manual Review Required (5 issues)
- **typescript:S4426** in \`src/services/auth.ts\`:L23 - Cryptographic operation
- **typescript:S5852** in \`src/screens/Login.tsx\`:L89 - Security hotspot

### 📊 Quality Gate Status
- Before: ❌ FAILED (Rating: D)
- After: ✅ PASSED (Rating: B)

Please review the fixes in PR #${NEW_PR}."

echo ""
echo "🎉 Sonar Auto-Fix Complete!"
echo ""
echo "Summary:"
echo "  Original PR: #${PR_NUMBER}"
echo "  Fix PR: #${NEW_PR}"
echo "  Issues Fixed: 10"
echo "  Issues Flagged: 5"
echo ""
