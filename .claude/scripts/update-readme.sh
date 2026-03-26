#!/usr/bin/env bash

set -euo pipefail

BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
REMOTE_REF="origin/${BRANCH}"

if ! git rev-parse --verify "$REMOTE_REF" >/dev/null 2>&1; then
  REMOTE_REF="origin/main"
fi

CHANGED="$(git diff --name-only "${REMOTE_REF}..HEAD" 2>/dev/null || true)"

if [ -z "$CHANGED" ]; then
  echo "📄 design-docs: no changes to push"
  exit 0
fi

SIGNIFICANT="$(echo "$CHANGED" | grep -v -E "^(yarn\.lock|Podfile\.lock|package-lock\.json|\.yarn/|ios/Podfile\.lock)" | grep -v -E "^docs/screenshots/" | grep -v "^README\.md$" | head -30)"

if [ -z "$SIGNIFICANT" ]; then
  echo "📄 design-docs: only non-documentation-significant files changed"
  exit 0
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "⚠️  design-docs: claude CLI not found — skipping README drift check"
  exit 0
fi

echo ""
echo "🎨 design-docs: checking README drift..."

DIFF_STAT="$(git diff --stat "${REMOTE_REF}..HEAD" 2>/dev/null | tail -3)"
AGENT_LIST="$(ls .claude/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort | tr '\n' ', ')"

PROMPT="You are the design-docs agent for the FUSE project.
Read .claude/agents/design-docs.md and .claude/skills/business-analysis/SKILL.md before deciding.

Changed files:
${SIGNIFICANT}

Diff summary:
${DIFF_STAT}

Current agent list:
${AGENT_LIST}

Current README.md:
$(cat README.md)

Output exactly one of:
- NO_CHANGE
- UPDATED_README:
<full updated README.md content>"

RESULT="$(echo "$PROMPT" | claude -p - --model claude-haiku-4-5-20251001 --output-format text 2>/dev/null || true)"

if [ -z "$RESULT" ]; then
  echo "⚠️  design-docs: empty response — skipping"
  exit 0
fi

if echo "$RESULT" | grep -q "^NO_CHANGE"; then
  echo "✅ design-docs: README is up to date"
  exit 0
fi

if echo "$RESULT" | grep -q "^UPDATED_README:"; then
  TMP_FILE="$(mktemp)"
  echo "$RESULT" | awk '/^UPDATED_README:/{found=1; next} found{print}' > "$TMP_FILE"
  if cmp -s "$TMP_FILE" README.md; then
    rm -f "$TMP_FILE"
    echo "✅ design-docs: README already matches generated content"
    exit 0
  fi
  mv "$TMP_FILE" README.md
  git add README.md
  echo "❌ README.md was updated by the documentation guard."
  echo "   Review the staged README.md and create a follow-up commit before pushing again."
  exit 1
fi

echo "⚠️  design-docs: unexpected response format — skipping"
exit 0
