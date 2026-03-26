#!/usr/bin/env bash
# Helper script to visualize agent orchestration statistics
# Usage: ./show-orchestration-stats.sh [days]

DAYS="${1:-7}"
CSV=".ai/router/orchestration.csv"

if [ ! -f "$CSV" ]; then
  echo "No orchestration data found"
  exit 0
fi

echo "🤖 Agent Orchestration Statistics (Last $DAYS days)"
echo "═══════════════════════════════════════════════════"
echo ""

# Get date threshold
if [[ "$OSTYPE" == "darwin"* ]]; then
  THRESHOLD=$(date -v-${DAYS}d +"%Y-%m-%d")
else
  THRESHOLD=$(date -d "$DAYS days ago" +"%Y-%m-%d")
fi

# Filter by date and calculate stats using Python
python3 << EOF
import csv
from collections import defaultdict
from datetime import datetime, timedelta

threshold = datetime.strptime('$THRESHOLD', '%Y-%m-%d')
stats = defaultdict(int)
agent_usage = defaultdict(int)
new_agents = []
total_requests = 0
successful_requests = 0
total_duration = 0

try:
    with open('$CSV', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                date = datetime.strptime(row['date'][:10], '%Y-%m-%d')
                if date >= threshold:
                    total_requests += 1
                    stats[row['request_type']] += 1
                    agent_usage[row['agent_used']] += 1
                    
                    if row['success'].lower() == 'true':
                        successful_requests += 1
                    
                    if row['created_new_agent'].lower() == 'true':
                        new_agents.append((row['date'], row['agent_used']))
                    
                    total_duration += int(row['duration_ms'])
            except (ValueError, KeyError):
                continue

    if total_requests == 0:
        print(f"No orchestration data in the last {$DAYS} days")
    else:
        print(f"📊 Summary")
        print(f"  Total Requests: {total_requests}")
        print(f"  Successful: {successful_requests} ({successful_requests*100//total_requests}%)")
        print(f"  Avg Duration: {total_duration//total_requests//1000}s")
        print()
        
        print("📋 Request Types")
        for req_type, count in sorted(stats.items(), key=lambda x: x[1], reverse=True):
            bar = '█' * (count * 20 // total_requests)
            print(f"  {req_type:25} {count:3} {bar}")
        print()
        
        print("🤖 Agent Usage")
        for agent, count in sorted(agent_usage.items(), key=lambda x: x[1], reverse=True):
            bar = '█' * (count * 20 // total_requests)
            percentage = count * 100 // total_requests
            print(f"  {agent:25} {count:3} ({percentage:2}%) {bar}")
        print()
        
        if new_agents:
            print("🆕 New Agents Created")
            for date, agent in new_agents:
                print(f"  {date[:10]} - {agent}")
            print()

except FileNotFoundError:
    print("No orchestration data found")
EOF

echo "═══════════════════════════════════════════════════"
echo ""
echo "💡 Tip: Run with different days: ./show-orchestration-stats.sh 30"
echo ""
