#!/usr/bin/env bash
# Hook: Stop — loga tokens do Claude (remoto) no token-usage.csv
# Lê transcript_path do payload e soma tokens de todas as mensagens da sessão

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"

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
