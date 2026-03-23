#!/usr/bin/env bash
# Generates docs/analytics.html from:
#   .ai/router/token-usage.csv      → cost over time, heatmap, model dist, KPIs
#   .ai/router/orchestration.csv    → agent costs, task tokens (optional)
#   .ai/router/pr-costs.csv         → PR costs, retries, errors (optional)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CSV_TOKENS="$REPO_ROOT/.ai/router/token-usage.csv"
CSV_ORCH="$REPO_ROOT/.ai/router/orchestration.csv"
CSV_PR="$REPO_ROOT/.ai/router/pr-costs.csv"
OUT_DIR="$REPO_ROOT/docs"
OUT="$OUT_DIR/analytics.html"

mkdir -p "$OUT_DIR"

python3 - "$CSV_TOKENS" "$CSV_ORCH" "$CSV_PR" "$OUT" << 'PYEOF'
import sys, os, json, math
from datetime import datetime, date, timedelta
from collections import defaultdict

csv_tokens = sys.argv[1]
csv_orch   = sys.argv[2]
csv_pr     = sys.argv[3]
out_path   = sys.argv[4]
now        = datetime.now().strftime('%Y-%m-%d %H:%M')

CLAUDE_INPUT_RATE  = 3.00   / 1_000_000
CLAUDE_OUTPUT_RATE = 15.00  / 1_000_000
CLAUDE_CACHE_RATE  = 0.30   / 1_000_000
HOURLY_RATE        = float(os.environ.get('HOURLY_RATE', '60'))

def estimate_cost(inp, out, cache):
    return inp * CLAUDE_INPUT_RATE + out * CLAUDE_OUTPUT_RATE + cache * CLAUDE_CACHE_RATE

# ── token-usage.csv ───────────────────────────────────────────────────────────

daily_cost  = defaultdict(float)          # date → USD (claude only)
daily_total = defaultdict(lambda: {'claude': 0, 'ollama': 0})  # date → tokens per provider
totals = {
    'claude': {'input': 0, 'output': 0, 'cache': 0, 'total': 0, 'cost': 0.0},
    'ollama': {'input': 0, 'output': 0, 'cache': 0, 'total': 0},
}
model_counts = defaultdict(int)   # model → total tokens

try:
    with open(csv_tokens, 'r') as f:
        for line in f.readlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) < 8:
                continue
            d        = parts[0][:10]
            provider = 'claude' if parts[2].lower() == 'claude' else 'ollama'
            model    = parts[3]
            inp      = int(parts[4])
            out      = int(parts[5])
            cache    = int(parts[6])
            total    = int(parts[7])
            daily_total[d][provider] += total
            model_counts[model] += total
            if provider == 'claude':
                cost = estimate_cost(inp, out, cache)
                daily_cost[d] += cost
                totals['claude']['input']  += inp
                totals['claude']['output'] += out
                totals['claude']['cache']  += cache
                totals['claude']['total']  += total
                totals['claude']['cost']   += cost
            else:
                totals['ollama']['input']  += inp
                totals['ollama']['output'] += out
                totals['ollama']['cache']  += cache
                totals['ollama']['total']  += total
except FileNotFoundError:
    pass
except Exception as e:
    print(f'⚠️  token-usage.csv error: {e}', file=sys.stderr)

# Last 30 days cost series
all_dates = sorted(daily_cost.keys())
cost_series = [{'date': d, 'cost': round(daily_cost[d], 4)} for d in all_dates[-30:]]

# KPIs — token-saving metrics
c = totals['claude']
o = totals['ollama']
cache_rate = 0.0
if (c['input'] + c['cache']) > 0:
    cache_rate = round(c['cache'] / (c['input'] + c['cache']) * 100, 1)
cache_savings = round(c['cache'] * (CLAUDE_INPUT_RATE - CLAUDE_CACHE_RATE), 4)
local_rate = 0.0
grand_total = c['total'] + o['total']
if grand_total > 0:
    local_rate = round(o['total'] / grand_total * 100, 1)
total_cost = round(c['cost'], 4)

kpis = {
    'cacheHitRate':   cache_rate,       # % of input resolved from cache
    'cacheSavingsUsd': cache_savings,   # USD saved vs full input price
    'localRate':      local_rate,       # % of tokens handled by Ollama (free)
    'totalCostUsd':   total_cost,
    'claudeTokens':   c['total'],
    'ollamaTokens':   o['total'],
}

# Model distribution for donut
model_dist = [{'model': m, 'tokens': t} for m, t in
              sorted(model_counts.items(), key=lambda x: -x[1])]

# ── orchestration.csv (optional) ─────────────────────────────────────────────

AGENT_TASK_MAP = {
    'react-native-engineer':  'implementation',
    'frontend-architect':     'architecture',
    'sonar-fixer':            'sonar',
    'pr-lifecycle':           'pr-lifecycle',
    'security-auditor':       'security',
    'test-engineer':          'tests',
}

agent_costs   = defaultdict(lambda: {'tokens': 0, 'cost': 0.0, 'task_type': 'other'})
task_tokens   = defaultdict(lambda: {'input': 0, 'output': 0, 'cache': 0})
has_orch = False

try:
    with open(csv_orch, 'r') as f:
        for line in f.readlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) < 11:
                continue
            agent   = parts[2]
            task    = parts[3]
            inp     = int(parts[6])
            out     = int(parts[7])
            cache   = int(parts[8])
            total   = int(parts[9])
            cost    = float(parts[10])
            agent_costs[agent]['tokens']    += total
            agent_costs[agent]['cost']      += cost
            agent_costs[agent]['task_type']  = task
            task_tokens[task]['input']  += inp
            task_tokens[task]['output'] += out
            task_tokens[task]['cache']  += cache
            has_orch = True
except FileNotFoundError:
    pass
except Exception as e:
    print(f'⚠️  orchestration.csv error: {e}', file=sys.stderr)

agent_cost_list = [
    {'agent': a, 'tokens': v['tokens'], 'cost': round(v['cost'], 4), 'taskType': v['task_type']}
    for a, v in sorted(agent_costs.items(), key=lambda x: -x[1]['cost'])
]
task_token_list = [
    {'task': t, 'input': v['input'], 'output': v['output'], 'cache': v['cache']}
    for t, v in task_tokens.items()
]

# ── pr-costs.csv (optional) ───────────────────────────────────────────────────

pr_costs    = []
error_costs = defaultdict(lambda: {'occurrences': 0, 'cost': 0.0})
has_pr = False

try:
    with open(csv_pr, 'r') as f:
        for line in f.readlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) < 8:
                continue
            pr_id    = int(parts[0])
            title    = parts[1]
            status   = parts[2]
            tokens   = int(parts[3])
            cost     = float(parts[4])
            retries  = int(parts[5])
            errors   = [e for e in parts[6].split('|') if e]
            merged   = parts[7] if parts[7] else None
            pr_costs.append({'id': pr_id, 'title': title, 'status': status,
                             'tokens': tokens, 'cost': round(cost, 4),
                             'retries': retries, 'errors': errors, 'mergedAt': merged})
            for e in errors:
                error_costs[e]['occurrences'] += 1
                error_costs[e]['cost']        += cost / max(len(errors), 1)
            has_pr = True
except FileNotFoundError:
    pass
except Exception as e:
    print(f'⚠️  pr-costs.csv error: {e}', file=sys.stderr)

error_cost_list = [
    {'type': t, 'occurrences': v['occurrences'], 'cost': round(v['cost'], 4)}
    for t, v in sorted(error_costs.items(), key=lambda x: -x[1]['cost'])
]

# ── Agent network graph ───────────────────────────────────────────────────────

AGENT_EDGES = [
    ('business-analyst',     'frontend-architect',    'flow'),
    ('frontend-architect',   'logic-engineer',        'flow'),
    ('frontend-architect',   'react-native-engineer', 'flow'),
    ('frontend-architect',   'code-reviewer',         'flow'),
    ('logic-engineer',       'ui-designer',           'flow'),
    ('ui-designer',          'react-native-engineer', 'flow'),
    ('react-native-engineer','code-reviewer',         'flow'),
    ('react-native-engineer','frontend-architect',    'retry'),
    ('logic-engineer',       'frontend-architect',    'retry'),
    ('sonar-auto-fixer',     'frontend-architect',    'retry'),
    ('code-reviewer',        'frontend-architect',    'dependency'),
    ('pr-lifecycle',         'sonar-auto-fixer',      'flow'),
    ('pr-lifecycle',         'code-reviewer',         'dependency'),
    ('coupling-analyzer',    'frontend-architect',    'flow'),
    ('coupling-analyzer',    'code-reviewer',         'flow'),
    ('performance-auditor',  'frontend-architect',    'flow'),
    ('test-writer',          'react-native-engineer', 'dependency'),
    ('test-write-e2e',       'pr-lifecycle',          'dependency'),
    ('doc-designer',         'pr-lifecycle',          'flow'),
]

AGENT_NODE_TYPES = {
    'business-analyst':      'architecture',
    'frontend-architect':    'architecture',
    'coupling-analyzer':     'architecture',
    'performance-auditor':   'architecture',
    'logic-engineer':        'implementation',
    'react-native-engineer': 'implementation',
    'ui-designer':           'implementation',
    'code-reviewer':         'qa',
    'test-writer':           'qa',
    'test-write-e2e':        'qa',
    'pr-lifecycle':          'automation',
    'sonar-auto-fixer':      'automation',
    'doc-designer':          'automation',
    'pr-review-fixer':       'automation',
}

node_token_map = {r['agent']: r['tokens'] for r in agent_cost_list}
node_cost_map  = {r['agent']: r['cost']   for r in agent_cost_list}

network_nodes = []
for name, ntype in AGENT_NODE_TYPES.items():
    network_nodes.append({
        'id':     name,
        'label':  ' '.join(w.capitalize() for w in name.split('-')),
        'type':   ntype,
        'tokens': node_token_map.get(name, 0),
        'cost':   node_cost_map.get(name, 0.0),
    })

network_edges = [
    {'source': s, 'target': t, 'edgeType': e}
    for s, t, e in AGENT_EDGES
]

agent_network = {'nodes': network_nodes, 'edges': network_edges}

# ── Agent documentation ────────────────────────────────────────────────────────
agents_dir = os.path.abspath(os.path.join(os.path.dirname(csv_tokens), '..', 'agents'))
agent_docs = {}
for agent_name in AGENT_NODE_TYPES.keys():
    md_path = os.path.join(agents_dir, f'{agent_name}.md')
    try:
        with open(md_path, 'r') as f:
            agent_docs[agent_name] = f.read()
    except FileNotFoundError:
        agent_docs[agent_name] = f'# {agent_name}\n\nNo documentation found.'

# ── ROI ───────────────────────────────────────────────────────────────────────

roi_series = []
HOURS_PER_SESSION = 1.0
cumulative_saved = 0.0
cumulative_cost  = 0.0
for entry in cost_series:
    sessions = daily_total[entry['date']]['claude']  # proxy: non-zero days
    human_saved = HOURS_PER_SESSION * HOURLY_RATE * (1 if daily_cost[entry['date']] > 0 else 0)
    cumulative_saved += human_saved
    cumulative_cost  += entry['cost']
    roi_series.append({
        'date':        entry['date'],
        'costUsd':     round(cumulative_cost, 4),
        'savedUsd':    round(cumulative_saved, 2),
        'netSavingUsd': round(cumulative_saved - cumulative_cost, 2),
    })

# ── JSON payload ─────────────────────────────────────────────────────────────

payload = json.dumps({
    'generatedAt': now,
    'kpis':         kpis,
    'costSeries':   cost_series,
    'modelDist':    model_dist,
    'agentCosts':   agent_cost_list,
    'taskTokens':   task_token_list,
    'prCosts':      pr_costs,
    'errorCosts':   error_cost_list,
    'roi':          roi_series,
    'hasOrch':      has_orch,
    'hasPR':        has_pr,
    'hourlyRate':   HOURLY_RATE,
    'agentNetwork': agent_network,
    'agentDocs':    agent_docs,
}, ensure_ascii=False, indent=2)

# ── HTML ─────────────────────────────────────────────────────────────────────

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE — Analytics Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
  <style>
    :root {{
      --bg:           #FFFAF0;
      --surface:      #F7F0E0;
      --surface-alt:  #F7EFDF;
      --border:       #3A001D;
      --text:         #06003a;
      --text-soft:    #5A2E3D;
      --accent-blue:  #AEE3F3;
      --accent-green: #BCEBCB;
      --accent-yellow:#FCCB66;
      --accent-orange:#FBC19D;
      --accent-purple:#CFBDDE;
      --accent-pink:  #F296B8;
      --radius:       12px;
      --radius-pill:  999px;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: 'Fredoka', sans-serif; background: var(--bg); color: var(--text); line-height: 1.55; }}
    a {{ color: var(--text-soft); text-decoration: underline; }}
    a:hover {{ color: var(--text); }}

    header {{
      background: var(--surface); border-bottom: 1px solid var(--border);
      padding: 14px 32px; display: flex; align-items: center;
      justify-content: space-between; flex-wrap: wrap; gap: 12px;
      position: sticky; top: 0; z-index: 10;
    }}
    .header-title {{ display: flex; align-items: center; gap: 10px; }}
    .header-logo {{ width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }}
    .header-title h1 {{ font-size: 1.2rem; font-weight: 600; letter-spacing: 0.01em; }}
    .header-title .badge {{
      background: var(--accent-purple); color: var(--text);
      border: 1px solid var(--border); font-size: 0.72rem; padding: 2px 10px;
      border-radius: var(--radius-pill); font-weight: 600;
    }}
    nav {{ display: flex; gap: 10px; flex-wrap: wrap; }}
    nav a {{
      color: var(--text-soft); text-decoration: none; font-size: 0.9rem;
      font-weight: 500; padding: 4px 14px; border-radius: var(--radius-pill);
      border: 1px solid var(--border); background: var(--bg); transition: background 0.15s;
    }}
    nav a:hover {{ background: var(--accent-yellow); color: var(--text); }}

    main {{ max-width: 1100px; margin: 0 auto; padding: 40px 24px; }}
    section {{ margin-bottom: 60px; }}
    .section-title {{
      font-weight: 600; margin-bottom: 20px; padding-bottom: 8px;
      border-bottom: 1px solid var(--border); color: var(--text-soft);
      text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.82rem;
    }}

    /* KPI cards */
    .kpi-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }}
    .kpi-card {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 18px 20px;
    }}
    .kpi-label {{ font-size: 0.72rem; font-weight: 600; color: var(--text-soft);
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }}
    .kpi-value {{ font-size: 1.8rem; font-weight: 700; color: var(--text); line-height: 1; }}
    .kpi-sub   {{ font-size: 0.75rem; color: var(--text-soft); margin-top: 4px; }}
    .kpi-good  {{ border-top: 3px solid var(--accent-green); }}
    .kpi-warn  {{ border-top: 3px solid var(--accent-yellow); }}
    .kpi-cost  {{ border-top: 3px solid var(--accent-pink); }}
    .kpi-info  {{ border-top: 3px solid var(--accent-blue); }}
    .kpi-purple{{ border-top: 3px solid var(--accent-purple); }}

    /* Charts */
    .charts-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
    .chart-full {{ grid-column: 1 / -1; }}
    .chart-half {{ grid-column: span 1; }}
    .chart-wrap {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px 24px;
    }}
    .chart-label {{
      font-size: 0.78rem; font-weight: 600; color: var(--text-soft);
      text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 16px;
    }}
    .chart-wrap canvas {{ max-height: 280px; }}
    .empty-state {{
      text-align: center; color: var(--text-soft); padding: 40px 20px;
      font-size: 0.88rem; line-height: 1.8;
    }}
    .empty-state code {{
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 7px;
      font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8em;
    }}

    /* Network graph */
    #network-graph {{ width: 100%; overflow: hidden; cursor: default; }}
    #network-graph svg {{ display: block; }}
    .net-node {{ cursor: pointer; transition: opacity 0.2s; }}
    .net-node:hover circle {{ stroke-width: 2.5; }}
    .net-label {{ pointer-events: none; user-select: none; }}
    .net-link {{ transition: opacity 0.2s; }}
    .net-popover {{
      position: fixed; background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 16px; font-size: 0.82rem;
      pointer-events: auto; display: none; z-index: 50; color: var(--text);
      box-shadow: 0 4px 16px rgba(58,0,29,0.18); min-width: 180px;
    }}
    .net-popover strong {{ display: block; font-size: 0.9rem; margin-bottom: 4px; }}
    .net-popover .net-pop-row {{ display: flex; justify-content: space-between; gap: 16px;
      font-size: 0.78rem; color: var(--text-soft); margin-top: 2px; }}
    .net-legend {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }}
    .net-legend-item {{ display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; color: var(--text-soft); }}
    .net-legend-dot {{ width: 12px; height: 12px; border-radius: 50%;
      border: 1px solid var(--border); flex-shrink: 0; }}
    .net-pop-link {{
      display: inline-block; margin-top: 8px; font-size: 0.78rem; font-weight: 600;
      color: var(--text-soft); text-decoration: underline; cursor: pointer;
      padding: 2px 0;
    }}
    .net-pop-link:hover {{ color: var(--text); }}

    /* Modal */
    .modal-backdrop {{
      display: none; position: fixed; inset: 0;
      background: rgba(58,0,29,0.45); z-index: 100; backdrop-filter: blur(4px);
    }}
    .modal-backdrop.open {{ display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }}
    .modal {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); width: 100%; max-width: 780px;
      max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;
    }}
    .modal-header {{
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 22px; border-bottom: 1px solid var(--border);
      flex-shrink: 0; gap: 12px; background: var(--surface-alt);
    }}
    .modal-header-left {{ display: flex; align-items: center; gap: 10px; min-width: 0; }}
    .modal-title {{ font-weight: 600; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }}
    .modal-close {{
      flex-shrink: 0; background: var(--bg); border: 1px solid var(--border);
      color: var(--text-soft); font-size: 1.1rem; cursor: pointer; line-height: 1;
      padding: 2px 8px; border-radius: var(--radius-pill); transition: background 0.12s;
    }}
    .modal-close:hover {{ background: var(--accent-pink); color: var(--text); }}
    .modal-body {{ overflow-y: auto; padding: 28px 32px; flex: 1; background: var(--bg); }}
    .md-content h1, .md-content h2, .md-content h3, .md-content h4 {{
      margin: 1.3em 0 0.45em; font-weight: 600; line-height: 1.3; color: var(--text);
    }}
    .md-content h1 {{ font-size: 1.4rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }}
    .md-content h2 {{ font-size: 1.1rem; }}
    .md-content h3 {{ font-size: 0.95rem; color: var(--text-soft); }}
    .md-content p  {{ margin: 0.55em 0; font-size: 0.9rem; color: var(--text); }}
    .md-content ul, .md-content ol {{ padding-left: 1.4em; margin: 0.4em 0; }}
    .md-content li {{ font-size: 0.9rem; color: var(--text); margin: 2px 0; }}
    .md-content code {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 6px; font-size: 0.83em; color: var(--text-soft);
      font-family: 'SFMono-Regular', Consolas, monospace;
    }}
    .md-content pre {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px; overflow-x: auto; margin: 0.7em 0;
    }}
    .md-content pre code {{ background: none; border: none; padding: 0; color: var(--text); font-size: 0.82rem; }}
    .md-content table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0.7em 0; }}
    .md-content th, .md-content td {{ padding: 7px 12px; border: 1px solid var(--border); text-align: left; }}
    .md-content th {{ background: var(--surface); color: var(--text-soft); font-weight: 600; }}
    .md-content blockquote {{
      border-left: 3px solid var(--border); margin: 0.5em 0;
      padding: 3px 14px; color: var(--text-soft); font-size: 0.88rem;
      background: var(--surface); border-radius: 0 8px 8px 0;
    }}
    .md-content hr {{ border: none; border-top: 1px solid var(--border); margin: 1em 0; }}
    .md-content a {{ color: var(--text-soft); }}

    footer {{
      text-align: center; padding: 32px 16px;
      font-size: 0.78rem; color: var(--text-soft);
      border-top: 1px solid var(--border); margin-top: 40px;
    }}
  </style>
</head>
<body>

<script id="analytics-data" type="application/json">
{payload}
</script>

<header>
  <div class="header-title">
    <img src="logo.png" alt="FUSE logo" class="header-logo" />
    <h1>FUSE — Analytics</h1>
    <span class="badge">Token Intelligence</span>
  </div>
  <nav>
    <a href="#network">Network</a>
    <a href="#savings">Token Savings</a>
    <a href="#cost">Cost Analysis</a>
    <a href="#agents">Agents</a>
    <a href="#pr">PR Costs</a>
    <a href="#roi">ROI</a>
    <a href="demonstration-orchestration.html">← Dashboard</a>
  </nav>
</header>

<!-- Modal -->
<div class="modal-backdrop" id="modal-backdrop">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-header-left">
        <span class="modal-title" id="modal-title"></span>
      </div>
      <button class="modal-close" id="modal-close" aria-label="Close">&times;</button>
    </div>
    <div class="modal-body">
      <div class="md-content" id="modal-content"></div>
    </div>
  </div>
</div>

<main>

  <!-- ── Agent Network Graph ─────────────────────────────────────────── -->
  <section id="network">
    <div class="section-title">Agent Orchestration Network</div>
    <div class="chart-wrap">
      <div class="chart-label">Click a node to highlight its connections · Drag to rearrange</div>
      <div id="network-graph"></div>
      <div class="net-legend" id="net-legend"></div>
    </div>
  </section>

  <!-- ── Token Savings KPIs ───────────────────────────────────────────── -->
  <section id="savings">
    <div class="section-title">Token Saving Strategies</div>
    <div class="kpi-grid" id="kpi-grid"></div>
  </section>

  <!-- ── Cost Analysis ────────────────────────────────────────────────── -->
  <section id="cost">
    <div class="section-title">Cost Analysis</div>
    <div class="charts-grid">
      <div class="chart-wrap chart-full">
        <div class="chart-label">Cost Over Time (last 30 days) · USD</div>
        <canvas id="chartCostTime"></canvas>
      </div>
      <div class="chart-wrap chart-half">
        <div class="chart-label">Model Distribution · Total Tokens</div>
        <canvas id="chartModelDist"></canvas>
      </div>
      <div class="chart-wrap chart-half" id="agent-cost-wrap">
        <div class="chart-label">Cost per Agent</div>
        <canvas id="chartAgentCost"></canvas>
      </div>
    </div>
  </section>

  <!-- ── Agents / Task Breakdown ──────────────────────────────────────── -->
  <section id="agents">
    <div class="section-title">Efficiency — Tokens per Task Type</div>
    <div class="charts-grid">
      <div class="chart-wrap chart-half" id="task-tokens-wrap">
        <div class="chart-label">Tokens per Task Type</div>
        <canvas id="chartTaskTokens"></canvas>
      </div>
      <div class="chart-wrap chart-half">
        <div class="chart-label">Remote vs Local Share · Total Tokens</div>
        <canvas id="chartProviderShare"></canvas>
      </div>
    </div>
  </section>

  <!-- ── PR Costs & Failures ──────────────────────────────────────────── -->
  <section id="pr">
    <div class="section-title">Failure Analysis · PR Costs</div>
    <div class="charts-grid">
      <div class="chart-wrap chart-half" id="pr-cost-wrap">
        <div class="chart-label">Cost per PR</div>
        <canvas id="chartPRCost"></canvas>
      </div>
      <div class="chart-wrap chart-half" id="error-cost-wrap">
        <div class="chart-label">Cost per Error Type</div>
        <canvas id="chartErrorCost"></canvas>
      </div>
    </div>
  </section>

  <!-- ── ROI ──────────────────────────────────────────────────────────── -->
  <section id="roi">
    <div class="section-title">ROI — Cost Avoided vs LLM Spend (cumulative · USD)</div>
    <div class="chart-wrap">
      <canvas id="chartROI"></canvas>
    </div>
  </section>

</main>

<footer>
  Generated: {now} · <a href="https://eugenioduarte.github.io/FUSE/" target="_blank">eugenioduarte.github.io/FUSE</a>
</footer>

<script>
(function () {{
  const d = JSON.parse(document.getElementById('analytics-data').textContent);
  const FONT = 'Fredoka';
  Chart.defaults.font.family = FONT;
  Chart.defaults.color = '#5A2E3D';

  // ── KPIs ─────────────────────────────────────────────────────────────
  const kpiDefs = [
    {{
      label: 'Cache Hit Rate',
      value: d.kpis.cacheHitRate + '%',
      sub: 'of Claude input from cache',
      cls: 'kpi-good',
      tip: 'Higher = less input cost. Target > 60%.'
    }},
    {{
      label: 'Cache Savings',
      value: '$' + d.kpis.cacheSavingsUsd.toFixed(3),
      sub: 'USD saved vs full input price',
      cls: 'kpi-good',
      tip: 'Savings from $3/1M → $0.30/1M cache rate.'
    }},
    {{
      label: 'Local (Ollama) Share',
      value: d.kpis.localRate + '%',
      sub: 'of all tokens — free',
      cls: 'kpi-purple',
      tip: 'More local = lower bill. Ollama runs at $0.'
    }},
    {{
      label: 'Total Claude Cost',
      value: '$' + d.kpis.totalCostUsd.toFixed(3),
      sub: 'USD spent since start',
      cls: 'kpi-cost',
      tip: 'Input $3/1M · Output $15/1M · Cache $0.30/1M'
    }},
    {{
      label: 'Claude Tokens',
      value: fmtNum(d.kpis.claudeTokens),
      sub: 'remote tokens (billable)',
      cls: 'kpi-warn'
    }},
    {{
      label: 'Ollama Tokens',
      value: fmtNum(d.kpis.ollamaTokens),
      sub: 'local tokens (free)',
      cls: 'kpi-info'
    }},
  ];
  const grid = document.getElementById('kpi-grid');
  kpiDefs.forEach(k => {{
    grid.innerHTML += `<div class="kpi-card ${{k.cls}}" title="${{k.tip || ''}}">
      <div class="kpi-label">${{k.label}}</div>
      <div class="kpi-value">${{k.value}}</div>
      <div class="kpi-sub">${{k.sub}}</div>
    </div>`;
  }});

  function fmtNum(n) {{
    if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+'M';
    if (n >= 1_000) return (n/1_000).toFixed(1)+'K';
    return String(n);
  }}

  // ── Cost Over Time ────────────────────────────────────────────────────
  if (d.costSeries.length > 0) {{
    new Chart(document.getElementById('chartCostTime'), {{
      type: 'bar',
      data: {{
        labels: d.costSeries.map(x => x.date),
        datasets: [{{
          label: 'Daily Cost (USD)',
          data: d.costSeries.map(x => x.cost),
          backgroundColor: 'rgba(174,227,243,0.8)',
          borderColor: '#3A001D',
          borderWidth: 1,
          borderRadius: 4,
        }}]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ display: false }}, tooltip: {{ callbacks: {{
          label: ctx => '$' + ctx.parsed.y.toFixed(4)
        }}}} }},
        scales: {{
          y: {{ ticks: {{ callback: v => '$' + v.toFixed(3) }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }},
          x: {{ grid: {{ display: false }}, ticks: {{ maxTicksLimit: 10 }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartCostTime').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Cost Over Time (last 30 days) · USD</div>' +
      '<div class="empty-state">No data yet.<br>Token usage will appear here once sessions are logged in <code>.ai/router/token-usage.csv</code></div>';
  }}

  // ── Model Distribution ────────────────────────────────────────────────
  if (d.modelDist.length > 0) {{
    const PALETTE = ['#AEE3F3','#BCEBCB','#FCCB66','#FBC19D','#CFBDDE','#F296B8'];
    new Chart(document.getElementById('chartModelDist'), {{
      type: 'doughnut',
      data: {{
        labels: d.modelDist.map(x => x.model),
        datasets: [{{
          data: d.modelDist.map(x => x.tokens),
          backgroundColor: PALETTE,
          borderColor: '#3A001D',
          borderWidth: 1,
        }}]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{
          legend: {{ position: 'bottom', labels: {{ font: {{ family: FONT }}, padding: 12 }} }},
          tooltip: {{ callbacks: {{ label: ctx => ctx.label + ': ' + fmtNum(ctx.parsed) + ' tokens' }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartModelDist').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Model Distribution</div><div class="empty-state">No data yet.</div>';
  }}

  // ── Agent Cost (orchestration.csv) ────────────────────────────────────
  const agentWrap = document.getElementById('agent-cost-wrap');
  if (d.hasOrch && d.agentCosts.length > 0) {{
    new Chart(document.getElementById('chartAgentCost'), {{
      type: 'bar',
      data: {{
        labels: d.agentCosts.map(x => x.agent),
        datasets: [{{
          label: 'Cost (USD)',
          data: d.agentCosts.map(x => x.cost),
          backgroundColor: 'rgba(207,189,222,0.85)',
          borderColor: '#3A001D', borderWidth: 1, borderRadius: 4,
        }}]
      }},
      options: {{
        indexAxis: 'y', responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ display: false }} }},
        scales: {{
          x: {{ ticks: {{ callback: v => '$'+v.toFixed(3) }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }},
          y: {{ grid: {{ display: false }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartAgentCost').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Cost per Agent</div>' +
      '<div class="empty-state">Waiting for agent data.<br>Set <code>CLAUDE_AGENT_NAME</code> in your hook to start tracking.</div>';
  }}

  // ── Provider Share ────────────────────────────────────────────────────
  {{
    const cTok = d.kpis.claudeTokens;
    const oTok = d.kpis.ollamaTokens;
    if (cTok + oTok > 0) {{
      new Chart(document.getElementById('chartProviderShare'), {{
        type: 'doughnut',
        data: {{
          labels: ['Remote (Claude)', 'Local (Ollama)'],
          datasets: [{{
            data: [cTok, oTok],
            backgroundColor: ['#AEE3F3','#BCEBCB'],
            borderColor: '#3A001D', borderWidth: 1,
          }}]
        }},
        options: {{
          responsive: true, maintainAspectRatio: true,
          plugins: {{
            legend: {{ position: 'bottom', labels: {{ font: {{ family: FONT }}, padding: 12 }} }},
            tooltip: {{ callbacks: {{ label: ctx => ctx.label + ': ' + fmtNum(ctx.parsed) + ' tokens' }} }}
          }}
        }}
      }});
    }} else {{
      document.getElementById('chartProviderShare').closest('.chart-wrap').innerHTML =
        '<div class="chart-label">Remote vs Local Share</div><div class="empty-state">No data yet.</div>';
    }}
  }}

  // ── Task Tokens (orchestration.csv) ───────────────────────────────────
  if (d.hasOrch && d.taskTokens.length > 0) {{
    new Chart(document.getElementById('chartTaskTokens'), {{
      type: 'bar',
      data: {{
        labels: d.taskTokens.map(x => x.task),
        datasets: [
          {{ label: 'Input',  data: d.taskTokens.map(x => x.input),  backgroundColor: 'rgba(174,227,243,0.8)', borderRadius: 4 }},
          {{ label: 'Output', data: d.taskTokens.map(x => x.output), backgroundColor: 'rgba(188,235,203,0.8)', borderRadius: 4 }},
          {{ label: 'Cache',  data: d.taskTokens.map(x => x.cache),  backgroundColor: 'rgba(252,203,102,0.8)', borderRadius: 4 }},
        ]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ position: 'bottom', labels: {{ font: {{ family: FONT }}, padding: 10 }} }} }},
        scales: {{
          x: {{ stacked: true, grid: {{ display: false }} }},
          y: {{ stacked: true, ticks: {{ callback: fmtNum }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartTaskTokens').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Tokens per Task Type</div>' +
      '<div class="empty-state">Waiting for orchestration data.<br><code>.ai/router/orchestration.csv</code> is populated by the stop hook.</div>';
  }}

  // ── PR Cost (pr-costs.csv) ────────────────────────────────────────────
  if (d.hasPR && d.prCosts.length > 0) {{
    const top = d.prCosts.slice(0, 15);
    new Chart(document.getElementById('chartPRCost'), {{
      type: 'bar',
      data: {{
        labels: top.map(x => '#' + x.id),
        datasets: [{{
          label: 'Cost (USD)',
          data: top.map(x => x.cost),
          backgroundColor: top.map(x => x.status === 'failed' ? 'rgba(242,150,184,0.8)' : 'rgba(188,235,203,0.8)'),
          borderColor: '#3A001D', borderWidth: 1, borderRadius: 4,
        }}]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ display: false }},
          tooltip: {{ callbacks: {{
            title: ctx => '#'+top[ctx[0].dataIndex].id+' '+top[ctx[0].dataIndex].title.substring(0,40),
            label: ctx => '$' + ctx.parsed.y.toFixed(4) + ' · retries: ' + top[ctx[0].dataIndex].retries
          }}}}
        }},
        scales: {{
          y: {{ ticks: {{ callback: v => '$'+v.toFixed(3) }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }},
          x: {{ grid: {{ display: false }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartPRCost').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Cost per PR</div>' +
      '<div class="empty-state">Waiting for PR data.<br><code>.ai/router/pr-costs.csv</code> is populated by <code>collect-pr-costs.sh</code> on merge.</div>';
  }}

  // ── Error Cost (pr-costs.csv) ─────────────────────────────────────────
  if (d.hasPR && d.errorCosts.length > 0) {{
    new Chart(document.getElementById('chartErrorCost'), {{
      type: 'bar',
      data: {{
        labels: d.errorCosts.map(x => x.type),
        datasets: [{{
          label: 'Cost (USD)',
          data: d.errorCosts.map(x => x.cost),
          backgroundColor: 'rgba(242,150,184,0.8)',
          borderColor: '#3A001D', borderWidth: 1, borderRadius: 4,
        }}]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{ legend: {{ display: false }} }},
        scales: {{
          y: {{ ticks: {{ callback: v => '$'+v.toFixed(3) }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }},
          x: {{ grid: {{ display: false }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartErrorCost').closest('.chart-wrap').innerHTML =
      '<div class="chart-label">Cost per Error Type</div>' +
      '<div class="empty-state">No error data yet.</div>';
  }}

  // ── ROI ────────────────────────────────────────────────────────────────
  if (d.roi.length > 0) {{
    new Chart(document.getElementById('chartROI'), {{
      type: 'line',
      data: {{
        labels: d.roi.map(x => x.date),
        datasets: [
          {{
            label: 'Estimated Human Cost Avoided',
            data: d.roi.map(x => x.savedUsd),
            borderColor: '#BCEBCB', backgroundColor: 'rgba(188,235,203,0.15)',
            borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3,
          }},
          {{
            label: 'LLM Spend (Cumulative)',
            data: d.roi.map(x => x.costUsd),
            borderColor: '#F296B8', backgroundColor: 'rgba(242,150,184,0.1)',
            borderWidth: 2, pointRadius: 0, fill: true, tension: 0.3,
          }},
          {{
            label: 'Net Saving',
            data: d.roi.map(x => x.netSavingUsd),
            borderColor: '#AEE3F3', backgroundColor: 'transparent',
            borderWidth: 2, borderDash: [5,4], pointRadius: 0, tension: 0.3,
          }},
        ]
      }},
      options: {{
        responsive: true, maintainAspectRatio: true,
        plugins: {{
          legend: {{ position: 'bottom', labels: {{ font: {{ family: FONT }}, padding: 12 }} }},
          tooltip: {{ callbacks: {{ label: ctx => ctx.dataset.label + ': $' + ctx.parsed.y.toFixed(2) }} }}
        }},
        scales: {{
          y: {{ ticks: {{ callback: v => '$'+v.toFixed(0) }}, grid: {{ color: 'rgba(58,0,29,0.08)' }} }},
          x: {{ grid: {{ display: false }}, ticks: {{ maxTicksLimit: 8 }} }}
        }}
      }}
    }});
  }} else {{
    document.getElementById('chartROI').closest('.chart-wrap').innerHTML =
      '<div class="empty-state">No data for ROI calculation yet.</div>';
  }}

  // ── Modal ─────────────────────────────────────────────────────────────
  const backdrop    = document.getElementById('modal-backdrop');
  const modalTitle  = document.getElementById('modal-title');
  const modalContent = document.getElementById('modal-content');
  function openAgentModal(agentId) {{
    const label = agentId.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    const markdown = d.agentDocs && d.agentDocs[agentId];
    modalTitle.textContent = label;
    modalContent.innerHTML = markdown ? marked.parse(markdown) : '<p>No documentation found.</p>';
    backdrop.classList.add('open');
    backdrop.querySelector('.modal-body').scrollTop = 0;
  }}
  function closeModal() {{ backdrop.classList.remove('open'); }}
  document.getElementById('modal-close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {{ if (e.target === backdrop) closeModal(); }});
  document.addEventListener('keydown', e => {{ if (e.key === 'Escape') closeModal(); }});

  // ── Agent Network Graph (D3 force-directed) ───────────────────────────
  (function renderNetwork() {{
    const net = d.agentNetwork;
    if (!net || !net.nodes || net.nodes.length === 0) return;

    const container = document.getElementById('network-graph');
    const W = container.clientWidth || 960;
    const H = 520;

    const TYPE_COLOR = {{
      'architecture':  '#CFBDDE',
      'implementation':'#AEE3F3',
      'qa':            '#BCEBCB',
      'automation':    '#FCCB66',
      'security':      '#FBC19D',
      'other':         '#E0E0E0',
    }};

    const EDGE_COLOR = {{
      'flow':       'rgba(58,0,29,0.35)',
      'retry':      'rgba(242,150,184,0.75)',
      'dependency': 'rgba(174,227,243,0.65)',
    }};

    // Legend
    const legendEl = document.getElementById('net-legend');
    Object.entries(TYPE_COLOR).forEach(([type, color]) => {{
      if (type === 'other') return;
      legendEl.innerHTML += `<div class="net-legend-item">
        <div class="net-legend-dot" style="background:${{color}}"></div>
        <span>${{type}}</span>
      </div>`;
    }});
    legendEl.innerHTML += `
      <div class="net-legend-item" style="margin-left:12px">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(58,0,29,0.4)" stroke-width="1.5"/></svg>
        <span>flow</span>
      </div>
      <div class="net-legend-item">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(242,150,184,0.85)" stroke-width="1.5"/></svg>
        <span>retry</span>
      </div>
      <div class="net-legend-item">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(174,227,243,0.8)" stroke-width="1.5" stroke-dasharray="4,3"/></svg>
        <span>dependency</span>
      </div>`;

    const svg = d3.select(container).append('svg')
      .attr('width', W).attr('height', H)
      .style('background', 'transparent');

    // Arrow markers
    const defs = svg.append('defs');
    Object.entries(EDGE_COLOR).forEach(([type, color]) => {{
      defs.append('marker')
        .attr('id', `arrow-${{type}}`)
        .attr('viewBox', '0 -4 8 8')
        .attr('refX', 18).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
          .attr('d', 'M0,-4L8,0L0,4')
          .attr('fill', color.slice(0, color.lastIndexOf(',')) + ',0.9)');
    }});

    // Compute node radius
    const maxTokens = Math.max(...net.nodes.map(n => n.tokens), 1);
    const radius = n => Math.max(9, Math.min(28, 9 + Math.sqrt(n.tokens / Math.max(maxTokens / 400, 1))));

    // Build adjacency for click highlight
    const neighbors = {{}};
    net.nodes.forEach(n => {{ neighbors[n.id] = new Set(); }});
    net.edges.forEach(e => {{
      neighbors[e.source]?.add(e.target);
      neighbors[e.target]?.add(e.source);
    }});

    // Clone nodes/edges so D3 can mutate them
    const nodes = net.nodes.map(n => ({{...n}}));
    const edges = net.edges.map(e => ({{...e}}));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(n => n.id).distance(130).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius(n => radius(n) + 18));

    const linkGroup = svg.append('g');
    const nodeGroup = svg.append('g');

    const link = linkGroup.selectAll('line')
      .data(edges).enter().append('line')
        .attr('class', 'net-link')
        .attr('stroke', e => EDGE_COLOR[e.edgeType] || EDGE_COLOR.flow)
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', e => e.edgeType === 'dependency' ? '5,3' : null)
        .attr('marker-end', e => `url(#arrow-${{e.edgeType}})`);

    const node = nodeGroup.selectAll('g')
      .data(nodes).enter().append('g')
        .attr('class', 'net-node')
        .call(d3.drag()
          .on('start', (event, n) => {{
            if (!event.active) sim.alphaTarget(0.3).restart();
            n.fx = n.x; n.fy = n.y;
          }})
          .on('drag', (event, n) => {{ n.fx = event.x; n.fy = event.y; }})
          .on('end', (event, n) => {{
            if (!event.active) sim.alphaTarget(0);
            n.fx = null; n.fy = null;
          }})
        );

    node.append('circle')
      .attr('r', radius)
      .attr('fill', n => TYPE_COLOR[n.type] || TYPE_COLOR.other)
      .attr('stroke', '#3A001D')
      .attr('stroke-width', 1);

    node.append('text')
      .attr('class', 'net-label')
      .attr('text-anchor', 'middle')
      .attr('dy', n => radius(n) + 13)
      .attr('font-family', 'Fredoka, sans-serif')
      .attr('font-size', 11)
      .attr('fill', '#5A2E3D')
      .text(n => n.label);

    sim.on('tick', () => {{
      link
        .attr('x1', e => e.source.x).attr('y1', e => e.source.y)
        .attr('x2', e => e.target.x).attr('y2', e => e.target.y);
      node.attr('transform', n => `translate(${{n.x}},${{n.y}})`);
    }});

    // Popover
    const popover = document.createElement('div');
    popover.className = 'net-popover';
    document.body.appendChild(popover);
    // Prevent popover clicks from bubbling to SVG (which would deselect)
    popover.addEventListener('click', e => e.stopPropagation());

    let selected = null;

    node.on('click', function(event, n) {{
      event.stopPropagation();
      if (selected === n.id) {{
        // deselect
        selected = null;
        node.style('opacity', 1);
        link.style('opacity', 1);
        popover.style.display = 'none';
        return;
      }}
      selected = n.id;

      const connected = neighbors[n.id] || new Set();
      node.style('opacity', m => (m.id === n.id || connected.has(m.id)) ? 1 : 0.18);
      link.style('opacity', e => {{
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        return (src === n.id || tgt === n.id) ? 1 : 0.06;
      }});

      const hasDoc = d.agentDocs && d.agentDocs[n.id];
      popover.innerHTML = `
        <strong>${{n.label}}</strong>
        <div class="net-pop-row"><span>Type</span><span>${{n.type}}</span></div>
        <div class="net-pop-row"><span>Tokens</span><span>${{fmtNum(n.tokens)}}</span></div>
        <div class="net-pop-row"><span>Cost</span><span>$${{n.cost.toFixed(3)}}</span></div>
        <div class="net-pop-row"><span>Connections</span><span>${{connected.size}}</span></div>
        ${{hasDoc ? `<span class="net-pop-link" data-agent="${{n.id}}">View agent docs →</span>` : ''}}`;
      popover.querySelector('.net-pop-link')?.addEventListener('click', () => openAgentModal(n.id));
      popover.style.display = 'block';
      popover.style.left = (event.clientX + 14) + 'px';
      popover.style.top  = (event.clientY - 10) + 'px';
    }});

    svg.on('click', () => {{
      selected = null;
      node.style('opacity', 1);
      link.style('opacity', 1);
      popover.style.display = 'none';
    }});

    node.on('mousemove', function(event) {{
      if (selected) {{
        popover.style.left = (event.clientX + 14) + 'px';
        popover.style.top  = (event.clientY - 10) + 'px';
      }}
    }});
  }})();

}})();
</script>
</body>
</html>'''

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'✅  analytics.html → {out_path}')
PYEOF
