#!/usr/bin/env bash
# Gera token-usage.md a partir do token-usage.csv
# Chamado pelo pre-push hook

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"
MD="$SCRIPT_DIR/token-usage.md"

python3 - "$CSV" "$MD" << 'PYEOF'
import sys
from datetime import datetime
from collections import defaultdict

csv_path = sys.argv[1]
md_path  = sys.argv[2]
now      = datetime.now().strftime('%Y-%m-%d %H:%M')

rows = []
try:
    with open(csv_path, 'r') as f:
        lines = [l.strip() for l in f.readlines()[1:] if l.strip()]
        for line in lines:
            parts = line.split(',')
            if len(parts) < 8:
                continue
            rows.append({
                'date':    parts[0],
                'session': parts[1][:8],   # short id
                'provider': parts[2],
                'model':   parts[3],
                'input':   int(parts[4]),
                'output':  int(parts[5]),
                'cache':   int(parts[6]),
                'total':   int(parts[7]),
            })
except FileNotFoundError:
    rows = []

# Totals by provider
by_provider = defaultdict(lambda: {'input': 0, 'output': 0, 'cache': 0, 'total': 0})
grand = {'input': 0, 'output': 0, 'cache': 0, 'total': 0}
for r in rows:
    p = r['provider']
    by_provider[p]['input']  += r['input']
    by_provider[p]['output'] += r['output']
    by_provider[p]['cache']  += r['cache']
    by_provider[p]['total']  += r['total']
    grand['input']  += r['input']
    grand['output'] += r['output']
    grand['cache']  += r['cache']
    grand['total']  += r['total']

def fmt(n):
    return f"{n:,}"

lines_out = []
lines_out.append(f"# Token Usage\n")
lines_out.append(f"> Last updated: {now}\n")
lines_out.append("")

# --- Summary ---
lines_out.append("## Summary\n")
lines_out.append("| Provider | Model | Input | Output | Cache Read | Total |")
lines_out.append("|----------|-------|------:|-------:|-----------:|------:|")
if by_provider:
    for provider, stats in sorted(by_provider.items()):
        model_counts = defaultdict(int)
        for r in rows:
            if r['provider'] == provider:
                model_counts[r['model']] += r['total']
        top_model = max(model_counts, key=model_counts.get) if model_counts else '—'
        lines_out.append(
            f"| {provider} | {top_model} | {fmt(stats['input'])} | {fmt(stats['output'])} | {fmt(stats['cache'])} | **{fmt(stats['total'])}** |"
        )
    lines_out.append(
        f"| **TOTAL** | | {fmt(grand['input'])} | {fmt(grand['output'])} | {fmt(grand['cache'])} | **{fmt(grand['total'])}** |"
    )
else:
    lines_out.append("| — | — | — | — | — | — |")

lines_out.append("")

# --- Log ---
lines_out.append("## Log\n")
lines_out.append("| Date | Session | Provider | Model | Input | Output | Cache Read | Total |")
lines_out.append("|------|---------|----------|-------|------:|-------:|-----------:|------:|")
if rows:
    for r in reversed(rows):  # most recent first
        lines_out.append(
            f"| {r['date']} | `{r['session']}` | {r['provider']} | {r['model']} "
            f"| {fmt(r['input'])} | {fmt(r['output'])} | {fmt(r['cache'])} | {fmt(r['total'])} |"
        )
else:
    lines_out.append("| — | — | — | — | — | — | — | — |")

with open(md_path, 'w') as f:
    f.write('\n'.join(lines_out) + '\n')

print(f"✅ token-usage.md updated ({len(rows)} rows, {grand['total']:,} total tokens)")
PYEOF
