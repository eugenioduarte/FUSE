#!/usr/bin/env bash
# Hook: Stop — loga tokens do Claude (remoto) no token-usage.csv
# Recebe JSON via stdin com campo "usage"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")
INPUT_TOKENS=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('usage',{}).get('input_tokens',0))" 2>/dev/null || echo "0")
OUTPUT_TOKENS=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('usage',{}).get('output_tokens',0))" 2>/dev/null || echo "0")
CACHE_READ=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('usage',{}).get('cache_read_input_tokens',0))" 2>/dev/null || echo "0")

# Só loga se tiver tokens reais
if [ "$INPUT_TOKENS" = "0" ] && [ "$OUTPUT_TOKENS" = "0" ]; then
  exit 0
fi

TOTAL=$((INPUT_TOKENS + OUTPUT_TOKENS))
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "$DATE,$SESSION_ID,claude,claude-sonnet-4-6,$INPUT_TOKENS,$OUTPUT_TOKENS,$CACHE_READ,$TOTAL" >> "$CSV"
