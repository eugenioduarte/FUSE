#!/usr/bin/env bash
# Hook: PostToolUse — loga tokens do Ollama (local) no token-usage.csv
# Recebe JSON via stdin com campos tool_name e tool_response

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"

INPUT=$(cat)

# Só processa tools do Ollama
TOOL_NAME=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_name',''))" 2>/dev/null || echo "")
if [[ "$TOOL_NAME" != mcp__ollama__ollama_chat ]] && [[ "$TOOL_NAME" != mcp__ollama__ollama_generate ]]; then
  exit 0
fi

SESSION_ID=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id','unknown'))" 2>/dev/null || echo "unknown")

# Ollama retorna eval_count (output) e prompt_eval_count (input) na resposta
OUTPUT_TOKENS=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
resp = d.get('tool_response', {})
# tool_response pode ser string JSON ou dict
if isinstance(resp, str):
    try:
        resp = json.loads(resp)
    except:
        resp = {}
print(resp.get('eval_count', 0))
" 2>/dev/null || echo "0")

INPUT_TOKENS=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
resp = d.get('tool_response', {})
if isinstance(resp, str):
    try:
        resp = json.loads(resp)
    except:
        resp = {}
print(resp.get('prompt_eval_count', 0))
" 2>/dev/null || echo "0")

MODEL=$(echo "$INPUT" | python3 -c "
import sys, json
d = json.load(sys.stdin)
inp = d.get('tool_input', {})
print(inp.get('model', 'qwen2.5-coder:14b'))
" 2>/dev/null || echo "qwen2.5-coder:14b")

if [ "$INPUT_TOKENS" = "0" ] && [ "$OUTPUT_TOKENS" = "0" ]; then
  exit 0
fi

TOTAL=$((INPUT_TOKENS + OUTPUT_TOKENS))
DATE=$(date +"%Y-%m-%d %H:%M:%S")

echo "$DATE,$SESSION_ID,ollama,$MODEL,$INPUT_TOKENS,$OUTPUT_TOKENS,0,$TOTAL" >> "$CSV"
