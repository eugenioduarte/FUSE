#!/usr/bin/env bash
# PR Lifecycle helper — polls CI status and prints a summary
# Usage: .ai/scripts/pr-lifecycle.sh <PR_NUMBER>
# This script is a diagnostic aide; the actual fixing is done by the /pr-lifecycle Claude Code agent.

set -e

PR_NUMBER="${1}"

if [ -z "$PR_NUMBER" ]; then
  echo "Usage: .ai/scripts/pr-lifecycle.sh <PR_NUMBER>"
  echo ""
  echo "To run the full autonomous agent, use the Claude Code slash command:"
  echo "  /pr-lifecycle [PR_NUMBER]"
  exit 1
fi

echo "🔄 PR Lifecycle Status"
echo "======================"
echo ""

# ── PR Info ──────────────────────────────────────────────────────────────────
echo "📋 PR #${PR_NUMBER} details..."
PR_INFO=$(gh pr view "$PR_NUMBER" --json number,title,headRefName,baseRefName,state,reviewDecision,mergeable 2>/dev/null)

if [ -z "$PR_INFO" ]; then
  echo "  ❌ PR not found. Check the number and try again."
  exit 1
fi

BRANCH=$(echo "$PR_INFO" | jq -r '.headRefName')
BASE=$(echo "$PR_INFO" | jq -r '.baseRefName')
TITLE=$(echo "$PR_INFO" | jq -r '.title')
STATE=$(echo "$PR_INFO" | jq -r '.state')
REVIEW=$(echo "$PR_INFO" | jq -r '.reviewDecision // "PENDING"')
MERGEABLE=$(echo "$PR_INFO" | jq -r '.mergeable')

echo "  Title:          $TITLE"
echo "  Branch:         $BRANCH → $BASE"
echo "  State:          $STATE"
echo "  Review:         $REVIEW"
echo "  Mergeable:      $MERGEABLE"
echo ""

# ── CI Checks ────────────────────────────────────────────────────────────────
echo "🔍 CI Checks..."
gh pr checks "$PR_NUMBER" 2>/dev/null || echo "  (No checks yet or gh pr checks unavailable)"
echo ""

# ── Review Comments ───────────────────────────────────────────────────────────
echo "💬 Review comments..."
COMMENT_COUNT=$(gh api "repos/{owner}/{repo}/pulls/${PR_NUMBER}/comments" --jq 'length' 2>/dev/null || echo "0")
echo "  Inline comments: $COMMENT_COUNT"

REVIEW_COUNT=$(gh pr view "$PR_NUMBER" --json reviews --jq '.reviews | length' 2>/dev/null || echo "0")
echo "  Reviews:         $REVIEW_COUNT"
echo ""

# ── Summary ──────────────────────────────────────────────────────────────────
echo "📊 Lifecycle Summary"
echo "  Phase 1 (PR created):    ✅"

CHECKS_JSON=$(gh pr checks "$PR_NUMBER" --json name,state 2>/dev/null || echo "[]")
FAILING=$(echo "$CHECKS_JSON" | jq '[.[] | select(.state == "FAILURE")] | length' 2>/dev/null || echo "?")
PASSING=$(echo "$CHECKS_JSON" | jq '[.[] | select(.state == "SUCCESS")] | length' 2>/dev/null || echo "?")

if [ "$FAILING" = "0" ] && [ "$PASSING" != "0" ]; then
  echo "  Phase 2 (CI passing):    ✅ ($PASSING checks passing)"
else
  echo "  Phase 2 (CI passing):    ⏳ ($PASSING passing, $FAILING failing)"
fi

if [ "$REVIEW" = "APPROVED" ]; then
  echo "  Phase 3 (Reviews):       ✅ APPROVED"
elif [ "$REVIEW" = "CHANGES_REQUESTED" ]; then
  echo "  Phase 3 (Reviews):       ⛔ CHANGES_REQUESTED ($COMMENT_COUNT comments)"
else
  echo "  Phase 3 (Reviews):       ⏳ $REVIEW"
fi

if [ "$STATE" = "MERGED" ]; then
  echo "  Phase 4 (Merged):        ✅"
elif [ "$REVIEW" = "APPROVED" ] && [ "$FAILING" = "0" ] && [ "$MERGEABLE" = "MERGEABLE" ]; then
  echo "  Phase 4 (Merged):        🟢 READY TO MERGE"
else
  echo "  Phase 4 (Merged):        ⏳ Not yet"
fi

echo ""
echo "👉 Run the autonomous agent: /pr-lifecycle ${PR_NUMBER}"
echo ""
