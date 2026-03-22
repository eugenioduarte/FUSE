#!/usr/bin/env bash

# ─────────────────────────────────────────────────────────────
# update-readme.sh — doc-designer agent trigger
#
# Called from .husky/pre-push after quality gates pass.
# Reviews the diff about to be pushed and updates README.md
# if meaningful changes warrant it.
#
# Requires: `claude` CLI authenticated (claude.ai/claude-code)
# ─────────────────────────────────────────────────────────────

set -e

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
REMOTE_REF="origin/${BRANCH}"

# Fallback: compare against main if remote branch doesn't exist
if ! git rev-parse --verify "$REMOTE_REF" > /dev/null 2>&1; then
  REMOTE_REF="origin/main"
fi

CHANGED=$(git diff --name-only "${REMOTE_REF}..HEAD" 2>/dev/null || true)

if [ -z "$CHANGED" ]; then
  echo "📄 doc-designer: no changes to push — skipping README check"
  exit 0
fi

# Filter out non-significant files
SIGNIFICANT=$(echo "$CHANGED" | grep -v -E \
  "^(yarn\.lock|Podfile\.lock|package-lock\.json|\.yarn/|ios/Podfile\.lock)" | \
  grep -v -E "^docs/screenshots/" | \
  grep -v "^README\.md$" | \
  head -30)

if [ -z "$SIGNIFICANT" ]; then
  echo "📄 doc-designer: only dependency/lock files changed — skipping README check"
  exit 0
fi

# Check claude CLI is available
if ! command -v claude &> /dev/null; then
  echo "⚠️  doc-designer: claude CLI not found — skipping README check"
  echo "   Install: https://claude.ai/claude-code"
  exit 0
fi

echo ""
echo "🎨 doc-designer: checking if README needs an update..."

DIFF_STAT=$(git diff --stat "${REMOTE_REF}..HEAD" 2>/dev/null | tail -3)
AGENT_LIST=$(ls .ai/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort | tr '\n' ', ')

PROMPT="You are the doc-designer agent for the FUSE React Native project.
Read .ai/agents/doc-designer.md for your full instructions and rules.

## Changed files in this push:
${SIGNIFICANT}

## Diff summary:
${DIFF_STAT}

## Current agent list:
${AGENT_LIST}

## Current README.md:
$(cat README.md)

Decide: does the README need updating based on the decision matrix in your instructions?

Output exactly one of:
- NO_CHANGE
- UPDATED_README:
<full updated README.md content>"

RESULT=$(echo "$PROMPT" | claude -p - --model claude-haiku-4-5-20251001 --output-format text 2>/dev/null || true)

if [ -z "$RESULT" ]; then
  echo "⚠️  doc-designer: claude returned empty response — skipping"
  exit 0
fi

if echo "$RESULT" | grep -q "^NO_CHANGE"; then
  echo "✅ doc-designer: README is up to date"
  exit 0
fi

if echo "$RESULT" | grep -q "^UPDATED_README:"; then
  echo "$RESULT" | sed 's/^UPDATED_README://' | sed '/^$/d' | head -1 > /dev/null
  echo "$RESULT" | awk '/^UPDATED_README:/{found=1; next} found{print}' > README.md
  git add README.md
  git commit --amend --no-edit --quiet
  echo "✅ doc-designer: README updated and included in this commit"
  exit 0
fi

echo "⚠️  doc-designer: unexpected response format — skipping"
exit 0
