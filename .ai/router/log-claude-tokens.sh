#!/usr/bin/env bash
# Hook: Stop — loga tokens do Claude (remoto) no token-usage.csv
# Lê transcript_path do payload e soma tokens de todas as mensagens da sessão

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"
CSV_ORCH="$SCRIPT_DIR/orchestration.csv"

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")
TRANSCRIPT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('transcript_path',''))" 2>/dev/null || echo "")

if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  exit 0
fi

RESULT=$(python3 - "$TRANSCRIPT" << 'PYEOF'
import sys, json

transcript_path = sys.argv[1]
totals = {'input': 0, 'output': 0, 'cache_read': 0}

try:
    with open(transcript_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entry = json.loads(line)
                msg = entry.get('message', {})
                if msg.get('role') == 'assistant' and 'usage' in msg:
                    usage = msg['usage']
                    totals['input'] += usage.get('input_tokens', 0)
                    totals['output'] += usage.get('output_tokens', 0)
                    totals['cache_read'] += usage.get('cache_read_input_tokens', 0)
            except Exception:
                pass
except Exception:
    sys.exit(0)

if totals['output'] == 0:
    sys.exit(0)

total = totals['input'] + totals['output']
print(f"{totals['input']},{totals['output']},{totals['cache_read']},{total}")
PYEOF
)

if [ -z "$RESULT" ]; then
  exit 0
fi

DATE=$(date +"%Y-%m-%d %H:%M:%S")
echo "$DATE,$SESSION_ID,claude,claude-sonnet-4-6,$RESULT" >> "$CSV"

# ── orchestration.csv ─────────────────────────────────────────────────────────
# Header: timestamp,session_id,agent_name,task_type,provider,model,input_tokens,output_tokens,cache_tokens,total_tokens,cost_usd
if [ ! -f "$CSV_ORCH" ]; then
  echo "timestamp,session_id,agent_name,task_type,provider,model,input_tokens,output_tokens,cache_tokens,total_tokens,cost_usd" >> "$CSV_ORCH"
fi

AGENT_NAME="${CLAUDE_AGENT_NAME:-unknown}"

# Map agent name → task type
TASK_TYPE=$(python3 -c "
MAP = {
    'react-native-engineer':  'implementation',
    'frontend-architect':     'architecture',
    'sonar-fixer':            'sonar',
    'pr-lifecycle':           'pr-lifecycle',
    'security-auditor':       'security',
    'test-engineer':          'tests',
    'business-analyst':       'architecture',
    'ui-designer':            'implementation',
}
import sys
print(MAP.get(sys.argv[1], 'other'))
" "$AGENT_NAME" 2>/dev/null || echo "other")

# Compute cost_usd from RESULT (input,output,cache,total)
COST=$(python3 -c "
parts = '$RESULT'.split(',')
if len(parts) < 4: print('0.0'); exit()
inp   = int(parts[0])
out   = int(parts[1])
cache = int(parts[2])
cost  = inp * 3.00/1_000_000 + out * 15.00/1_000_000 + cache * 0.30/1_000_000
print(round(cost, 6))
" 2>/dev/null || echo "0.0")

echo "$DATE,$SESSION_ID,$AGENT_NAME,$TASK_TYPE,claude,claude-sonnet-4-6,$RESULT,$COST" >> "$CSV_ORCH"
