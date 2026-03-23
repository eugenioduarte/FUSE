#!/usr/bin/env bash
# Local dev server for docs/
# Usage: bash .ai/scripts/dev-server.sh [port]
# Generates both dashboards, serves on localhost, auto-regenerates when CSVs change.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PORT="${1:-8080}"

# ── Cleanup on exit ───────────────────────────────────────────────────────────
WATCHER_PID=""
cleanup() {
  [ -n "$WATCHER_PID" ] && kill "$WATCHER_PID" 2>/dev/null || true
  echo ""
  echo "Server stopped."
}
trap cleanup EXIT INT TERM

# ── Initial generation ────────────────────────────────────────────────────────
echo "Generating dashboards..."
bash "$REPO_ROOT/.ai/scripts/generate-dashboard.sh"
bash "$REPO_ROOT/.ai/scripts/generate-analytics.sh"

echo ""
echo "  Dashboard:  http://localhost:$PORT/demonstration-orchestration.html"
echo "  Analytics:  http://localhost:$PORT/analytics.html"
echo ""
echo "  Ctrl+C to stop"

# ── CSV watcher (auto-regenerate) ─────────────────────────────────────────────
if command -v fswatch >/dev/null 2>&1; then
  fswatch -o "$REPO_ROOT/.ai/router/"*.csv 2>/dev/null | while read -r _; do
    echo "  CSV changed — regenerating..."
    bash "$REPO_ROOT/.ai/scripts/generate-dashboard.sh" 2>&1 | grep -E '(✅|⚠️)' || true
    bash "$REPO_ROOT/.ai/scripts/generate-analytics.sh" 2>&1 | grep -E '(✅|⚠️)' || true
    echo "  Done. Refresh your browser."
  done &
  WATCHER_PID=$!
  echo "  Watching .ai/router/*.csv for changes (fswatch)"
else
  echo "  (install fswatch for auto-regenerate: brew install fswatch)"
fi

echo ""

# ── Serve ─────────────────────────────────────────────────────────────────────
python3 -m http.server "$PORT" --directory "$REPO_ROOT/docs"
