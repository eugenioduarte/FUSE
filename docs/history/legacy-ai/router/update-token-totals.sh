#!/usr/bin/env bash
# Pre-push hook: Calculate and display daily token usage statistics
# Reads token-usage.csv and shows today's totals by provider

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV="$SCRIPT_DIR/token-usage.csv"

# Check if CSV exists
if [ ! -f "$CSV" ]; then
  echo "⚠️  No token usage data found"
  exit 0
fi

# Get today's date
TODAY=$(date +"%Y-%m-%d")

# Calculate totals using awk
python3 << 'EOF'
import sys
from datetime import datetime
from collections import defaultdict

csv_path = sys.argv[1] if len(sys.argv) > 1 else '.ai/router/token-usage.csv'
today = sys.argv[2] if len(sys.argv) > 2 else datetime.now().strftime('%Y-%m-%d')

totals = defaultdict(lambda: {'input': 0, 'output': 0, 'cache': 0, 'total': 0})
overall = {'input': 0, 'output': 0, 'cache': 0, 'total': 0}

try:
    with open(csv_path, 'r') as f:
        lines = f.readlines()[1:]  # Skip header
        
        for line in lines:
            if not line.strip():
                continue
                
            parts = line.strip().split(',')
            if len(parts) < 8:
                continue
                
            date_str = parts[0][:10]  # Extract YYYY-MM-DD
            provider = parts[2]
            input_tokens = int(parts[4])
            output_tokens = int(parts[5])
            cache_tokens = int(parts[6])
            total_tokens = int(parts[7])
            
            if date_str == today:
                totals[provider]['input'] += input_tokens
                totals[provider]['output'] += output_tokens
                totals[provider]['cache'] += cache_tokens
                totals[provider]['total'] += total_tokens
                
                overall['input'] += input_tokens
                overall['output'] += output_tokens
                overall['cache'] += cache_tokens
                overall['total'] += total_tokens
    
    if overall['total'] == 0:
        print(f"ℹ️  No tokens used today ({today})")
    else:
        print(f"\n📊 Token Usage for {today}")
        print("=" * 60)
        
        for provider in sorted(totals.keys()):
            stats = totals[provider]
            print(f"\n{provider.upper()}:")
            print(f"  Input:      {stats['input']:,} tokens")
            print(f"  Output:     {stats['output']:,} tokens")
            if stats['cache'] > 0:
                print(f"  Cache Read: {stats['cache']:,} tokens")
            print(f"  Total:      {stats['total']:,} tokens")
        
        print(f"\n{'─' * 60}")
        print(f"OVERALL TOTAL: {overall['total']:,} tokens")
        print(f"  • Input:  {overall['input']:,}")
        print(f"  • Output: {overall['output']:,}")
        if overall['cache'] > 0:
            print(f"  • Cache:  {overall['cache']:,}")
        print("=" * 60 + "\n")

except FileNotFoundError:
    print(f"⚠️  Token usage file not found: {csv_path}")
except Exception as e:
    print(f"⚠️  Error reading token usage: {e}")

EOF

python3 -c "
import sys
csv_path = '$CSV'
today = '$TODAY'
" "$CSV" "$TODAY"

exit 0
