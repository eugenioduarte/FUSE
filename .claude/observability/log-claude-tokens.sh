#!/usr/bin/env bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"
CSV_ORCH="$SCRIPT_DIR/orchestration.csv"

INPUT="$(cat)"

SESSION_ID="$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")"
TRANSCRIPT="$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('transcript_path',''))" 2>/dev/null || echo "")"

if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

if [ ! -f "$CSV" ]; then
  echo "date,session_id,provider,model,input_tokens,output_tokens,cache_read,total_tokens" > "$CSV"
fi

if [ ! -f "$CSV_ORCH" ]; then
  echo "timestamp,session_id,agent_name,task_type,provider,model,input_tokens,output_tokens,cache_tokens,total_tokens,cost_usd" > "$CSV_ORCH"
fi

RESULT="$(python3 - "$TRANSCRIPT" <<'PYEOF'
import sys, json

transcript_path = sys.argv[1]
totals = {"input": 0, "output": 0, "cache_read": 0}

with open(transcript_path, "r", encoding="utf-8") as fh:
    for line in fh:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
        except Exception:
            continue
        msg = entry.get("message", {})
        usage = msg.get("usage", {})
        if msg.get("role") == "assistant" and usage:
            totals["input"] += int(usage.get("input_tokens", 0) or 0)
            totals["output"] += int(usage.get("output_tokens", 0) or 0)
            totals["cache_read"] += int(usage.get("cache_read_input_tokens", 0) or 0)

if totals["output"] == 0:
    sys.exit(0)

total = totals["input"] + totals["output"]
print(f'{totals["input"]},{totals["output"]},{totals["cache_read"]},{total}')
PYEOF
)"

if [ -z "$RESULT" ]; then
  exit 0
fi

DATE="$(date +"%Y-%m-%d %H:%M:%S")"
echo "$DATE,$SESSION_ID,claude,claude-sonnet-4-6,$RESULT" >> "$CSV"

AGENT_NAME="${CLAUDE_AGENT_NAME:-unknown}"
TASK_TYPE="$(python3 - "$AGENT_NAME" <<'PYEOF'
import sys
mapping = {
    "architect": "architecture",
    "design-docs": "documentation",
    "engineer": "implementation",
    "pr-lifecycle": "pr-lifecycle",
    "quality": "quality",
    "reviewer": "review",
    "security-analyst": "security",
    "test-writer": "tests",
}
print(mapping.get(sys.argv[1], "other"))
PYEOF
)"

COST="$(python3 - "$RESULT" <<'PYEOF'
import sys
parts = sys.argv[1].split(",")
inp = int(parts[0])
out = int(parts[1])
cache = int(parts[2])
cost = inp * 3.0 / 1_000_000 + out * 15.0 / 1_000_000 + cache * 0.3 / 1_000_000
print(round(cost, 6))
PYEOF
)"

echo "$DATE,$SESSION_ID,$AGENT_NAME,$TASK_TYPE,claude,claude-sonnet-4-6,$RESULT,$COST" >> "$CSV_ORCH"
