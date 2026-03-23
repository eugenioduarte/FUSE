#!/usr/bin/env bash
# Generates docs/demonstration-orchestration.html from:
#   .ai/agents/*.md          →  agent cards
#   .ai/{rules,skills,...}   →  doc cards grouped by folder
#   .ai/router/token-usage.csv  →  Chart.js token chart

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
AI_DIR="$REPO_ROOT/.ai"
CSV="$REPO_ROOT/.ai/router/token-usage.csv"
OUT_DIR="$REPO_ROOT/docs"
OUT="$OUT_DIR/demonstration-orchestration.html"

mkdir -p "$OUT_DIR"

# Copy logo to docs/ so it's available on GitHub Pages
cp "$REPO_ROOT/assets/images/logo.png" "$OUT_DIR/logo.png" 2>/dev/null || true

python3 - "$AI_DIR" "$CSV" "$OUT" << 'PYEOF'
import sys, os, json, re
from datetime import datetime
from collections import defaultdict

ai_dir   = sys.argv[1]
csv_path = sys.argv[2]
out_path = sys.argv[3]
now      = datetime.now().strftime('%Y-%m-%d %H:%M')

# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_section(text, heading):
    pattern = rf'##\s+[^\n]*{re.escape(heading.strip())}[^\n]*\n(.*?)(?=\n##\s|\Z)'
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ''

def first_meaningful_line(text):
    """Return the first non-empty, non-blockquote, non-heading line."""
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith('#') or line.startswith('>') or line.startswith('---'):
            continue
        line = re.sub(r'\*+', '', line).strip()
        if line:
            return line
    return '—'

def read_md(filepath):
    try:
        return open(filepath, 'r', encoding='utf-8').read()
    except Exception:
        return ''

# ── Agents ───────────────────────────────────────────────────────────────────

def parse_agent(filepath):
    name = os.path.basename(filepath).replace('.md', '').strip()
    if name.lower() == 'readme':
        return None
    content = read_md(filepath)
    if not content:
        return None

    role_block = extract_section(content, 'Role')
    role_lines = [l.strip() for l in role_block.splitlines() if l.strip() and not l.strip().startswith('#')]
    role = re.sub(r'\*+', '', role_lines[0]).strip() if role_lines else '—'

    llm_block = extract_section(content, 'LLM').lower()
    if 'always remote' in llm_block or ('remote' in llm_block and 'always' in llm_block):
        routing = 'remote'
    elif 'always local' in llm_block or ('local' in llm_block and 'always' in llm_block):
        routing = 'local'
    else:
        routing = 'conditional'

    model = '—'
    m = re.search(r'`(claude-[a-z0-9\-\.]+|qwen[a-z0-9\-\.:]+)`', content, re.IGNORECASE)
    if m:
        model = m.group(1)

    return {'name': name, 'role': role, 'routing': routing, 'model': model, 'markdown': content}

agents = []
agents_dir = os.path.join(ai_dir, 'agents')
try:
    for fname in sorted(os.listdir(agents_dir)):
        if fname.endswith('.md'):
            a = parse_agent(os.path.join(agents_dir, fname))
            if a:
                agents.append(a)
except Exception as e:
    print(f'⚠️  Agents error: {e}', file=sys.stderr)

# ── Doc groups ───────────────────────────────────────────────────────────────

# (folder_key, label, glob_path, skip_names)
DOC_GROUPS = [
    ('system',    'System',    '',           ['agents', '_sdd', 'business', 'docs', 'router', 'rules', 'skills', 'security', 'templates', 'analysis', 'scripts']),
    ('rules',     'Rules',     'rules',      ['readme']),
    ('skills',    'Skills',    'skills',     ['readme']),
    ('security',  'Security',  'security',   ['readme']),
    ('templates', 'Templates', 'templates',  ['readme']),
    ('router',    'Router',    'router',     ['readme', 'token-usage']),
]

def parse_doc(filepath, folder_key):
    name = os.path.basename(filepath).replace('.md', '').strip()
    if name.lower() in ('readme',):
        return None
    content = read_md(filepath)
    if not content:
        return None
    desc = first_meaningful_line(content)
    return {'name': name, 'desc': desc, 'folder': folder_key, 'markdown': content}

doc_groups = []
for key, label, subpath, skip in DOC_GROUPS:
    target = os.path.join(ai_dir, subpath) if subpath else ai_dir
    docs = []
    try:
        entries = sorted(os.listdir(target))
        for fname in entries:
            fpath = os.path.join(target, fname)
            # For root .ai dir, skip subdirectories and non-.md
            if subpath == '' and os.path.isdir(fpath):
                continue
            if not fname.endswith('.md'):
                continue
            stem = fname.replace('.md', '').strip().lower()
            if stem in skip:
                continue
            d = parse_doc(fpath, key)
            if d:
                docs.append(d)
    except Exception as e:
        print(f'⚠️  Doc group {key} error: {e}', file=sys.stderr)
    if docs:
        doc_groups.append({'key': key, 'label': label, 'docs': docs})

# ── Token parsing ────────────────────────────────────────────────────────────

daily   = defaultdict(lambda: {'claude': 0, 'ollama': 0})
totals  = {
    'claude': {'input': 0, 'output': 0, 'cache': 0, 'total': 0},
    'ollama': {'input': 0, 'output': 0, 'cache': 0, 'total': 0},
}
try:
    with open(csv_path, 'r') as f:
        for line in f.readlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) < 8:
                continue
            date     = parts[0][:10]
            provider = 'claude' if parts[2].lower() == 'claude' else 'ollama'
            inp      = int(parts[4])
            out      = int(parts[5])
            cache    = int(parts[6])
            total    = int(parts[7])
            daily[date][provider] += total
            totals[provider]['input']  += inp
            totals[provider]['output'] += out
            totals[provider]['cache']  += cache
            totals[provider]['total']  += total
except FileNotFoundError:
    pass
except Exception as e:
    print(f'⚠️  CSV error: {e}', file=sys.stderr)

# last 7 days only for bar chart
all_dates = sorted(daily.keys())
last7     = all_dates[-7:]
token_data = [
    {'date': d, 'claude': daily[d]['claude'], 'ollama': daily[d]['ollama']}
    for d in last7
]

# ── JSON payload ─────────────────────────────────────────────────────────────

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
    # Security agents
    ('performance-auditor',  'security-orchestrator', 'flow'),
    ('security-orchestrator','sa1-storage',           'flow'),
    ('security-orchestrator','sa2-crypto',            'flow'),
    ('security-orchestrator','sa3-network',           'flow'),
    ('security-orchestrator','sa4-auth',              'flow'),
    ('security-orchestrator','sa5-platform',          'flow'),
    ('security-orchestrator','sa6-code',              'flow'),
    ('security-orchestrator','sa7-resilience',        'flow'),
    ('sa1-storage',          'security-orchestrator', 'dependency'),
    ('sa2-crypto',           'security-orchestrator', 'dependency'),
    ('sa3-network',          'security-orchestrator', 'dependency'),
    ('sa4-auth',             'security-orchestrator', 'dependency'),
    ('sa5-platform',         'security-orchestrator', 'dependency'),
    ('sa6-code',             'security-orchestrator', 'dependency'),
    ('sa7-resilience',       'security-orchestrator', 'dependency'),
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
    # Security agents
    'security-orchestrator': 'security',
    'sa1-storage':           'security',
    'sa2-crypto':            'security',
    'sa3-network':           'security',
    'sa4-auth':              'security',
    'sa5-platform':          'security',
    'sa6-code':              'security',
    'sa7-resilience':        'security',
}

# Read orchestration.csv for per-agent token/cost data (same as analytics)
csv_orch = os.path.join(os.path.dirname(csv_path), 'orchestration.csv')
orch_tokens = defaultdict(int)
orch_cost   = defaultdict(float)
try:
    with open(csv_orch, 'r') as f:
        for line in f.readlines()[1:]:
            line = line.strip()
            if not line:
                continue
            parts = line.split(',')
            if len(parts) < 11:
                continue
            agent = parts[2]
            orch_tokens[agent] += int(parts[9])
            orch_cost[agent]   += float(parts[10])
except FileNotFoundError:
    pass

network_nodes = [
    {
        'id':     name,
        'label':  ' '.join(w.capitalize() for w in name.split('-')),
        'type':   ntype,
        'tokens': orch_tokens.get(name, 0),
        'cost':   round(orch_cost.get(name, 0.0), 4),
    }
    for name, ntype in AGENT_NODE_TYPES.items()
]
network_edges = [{'source': s, 'target': t, 'edgeType': e} for s, t, e in AGENT_EDGES]
agent_network = {'nodes': network_nodes, 'edges': network_edges}

# ── JSON payload ─────────────────────────────────────────────────────────────

payload = json.dumps({
    'generatedAt': now,
    'agents': agents,
    'docGroups': doc_groups,
    'tokenUsage': token_data,
    'tokenTotals': totals,
    'agentNetwork': agent_network,
}, ensure_ascii=False, indent=2)

# ── HTML ─────────────────────────────────────────────────────────────────────

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE — AI Engineering Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
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
    body {{
      font-family: 'Fredoka', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }}
    a {{ color: var(--text-soft); text-decoration: underline; }}
    a:hover {{ color: var(--text); }}

    /* Header */
    header {{
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 14px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }}
    .header-title {{ display: flex; align-items: center; gap: 10px; }}
    .header-logo {{ width: 32px; height: 32px; border-radius: 8px; object-fit: cover; }}
    .header-title h1 {{ font-size: 1.2rem; font-weight: 600; letter-spacing: 0.01em; }}
    .header-title .badge {{
      background: var(--accent-orange);
      color: var(--text);
      border: 1px solid var(--border);
      font-size: 0.72rem; padding: 2px 10px;
      border-radius: var(--radius-pill);
      font-weight: 600;
    }}
    nav {{ display: flex; gap: 10px; flex-wrap: wrap; }}
    nav a {{
      color: var(--text-soft);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      padding: 4px 14px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border);
      background: var(--bg);
      transition: background 0.15s;
    }}
    nav a:hover {{ background: var(--accent-yellow); color: var(--text); }}

    /* Layout */
    main {{ max-width: 1100px; margin: 0 auto; padding: 40px 24px; }}
    section {{ margin-bottom: 60px; }}
    .section-title {{
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-size: 0.82rem;
    }}
    .subsection-label {{
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: 0.07em;
      margin: 28px 0 10px;
    }}
    .subsection-label:first-child {{ margin-top: 0; }}

    /* Card grid */
    .card-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }}

    /* Cards */
    .agent-card, .doc-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: transform 0.12s ease, background 0.12s;
    }}
    .agent-card:hover, .doc-card:hover {{
      background: var(--surface-alt);
      transform: scale(0.98);
    }}
    .agent-card:active, .doc-card:active {{
      transform: scale(0.97);
    }}
    .card-header {{ display: flex; align-items: center; justify-content: space-between; gap: 8px; }}
    .card-name {{ font-weight: 600; font-size: 0.95rem; word-break: break-all; color: var(--text); }}
    .routing-badge {{
      flex-shrink: 0;
      font-size: 0.68rem;
      padding: 2px 9px;
      border-radius: var(--radius-pill);
      font-weight: 600;
      border: 1px solid var(--border);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text);
    }}
    .routing-remote      {{ background: var(--accent-blue);   }}
    .routing-local       {{ background: var(--accent-green);  }}
    .routing-conditional {{ background: var(--accent-yellow); }}
    .card-desc  {{ font-size: 0.85rem; color: var(--text-soft); }}
    .card-model {{
      font-size: 0.73rem; color: var(--text-soft);
      font-family: 'SFMono-Regular', Consolas, monospace;
      background: var(--bg); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 7px; display: inline-block; width: fit-content;
    }}
    .card-hint {{ font-size: 0.7rem; color: var(--text-soft); opacity: 0.6; margin-top: 2px; }}

    /* Doc folder badge */
    .folder-badge {{
      flex-shrink: 0;
      font-size: 0.68rem;
      padding: 2px 9px;
      border-radius: var(--radius-pill);
      font-weight: 600;
      border: 1px solid var(--border);
      background: var(--accent-orange);
      color: var(--text);
    }}

    /* Modal */
    .modal-backdrop {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(58,0,29,0.45);
      z-index: 100;
      backdrop-filter: blur(4px);
    }}
    .modal-backdrop.open {{ display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }}
    .modal {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      width: 100%;
      max-width: 780px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}
    .modal-header {{
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 22px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      gap: 12px;
      background: var(--surface-alt);
    }}
    .modal-header-left {{ display: flex; align-items: center; gap: 10px; min-width: 0; }}
    .modal-title {{ font-weight: 600; font-size: 1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text); }}
    .modal-close {{
      flex-shrink: 0;
      background: var(--bg); border: 1px solid var(--border);
      color: var(--text-soft); font-size: 1.1rem;
      cursor: pointer; line-height: 1; padding: 2px 8px;
      border-radius: var(--radius-pill);
      transition: background 0.12s;
    }}
    .modal-close:hover {{ background: var(--accent-pink); color: var(--text); }}
    .modal-body {{ overflow-y: auto; padding: 28px 32px; flex: 1; background: var(--bg); }}

    /* Markdown styles */
    .md-content h1, .md-content h2, .md-content h3, .md-content h4 {{
      margin: 1.3em 0 0.45em; font-weight: 600; line-height: 1.3;
      color: var(--text);
    }}
    .md-content h1 {{ font-size: 1.4rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }}
    .md-content h2 {{ font-size: 1.1rem; }}
    .md-content h3 {{ font-size: 0.95rem; color: var(--text-soft); }}
    .md-content h4 {{ font-size: 0.88rem; color: var(--text-soft); }}
    .md-content p  {{ margin: 0.55em 0; font-size: 0.9rem; color: var(--text); }}
    .md-content ul, .md-content ol {{ padding-left: 1.4em; margin: 0.4em 0; }}
    .md-content li {{ font-size: 0.9rem; color: var(--text); margin: 2px 0; }}
    .md-content code {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 6px;
      font-size: 0.83em; color: var(--text-soft);
      font-family: 'SFMono-Regular', Consolas, monospace;
    }}
    .md-content pre {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px;
      overflow-x: auto; margin: 0.7em 0;
    }}
    .md-content pre code {{
      background: none; border: none; padding: 0;
      color: var(--text); font-size: 0.82rem;
    }}
    .md-content table {{
      width: 100%; border-collapse: collapse;
      font-size: 0.85rem; margin: 0.7em 0;
    }}
    .md-content th, .md-content td {{
      padding: 7px 12px; border: 1px solid var(--border); text-align: left;
    }}
    .md-content th {{ background: var(--surface); color: var(--text-soft); font-weight: 600; }}
    .md-content blockquote {{
      border-left: 3px solid var(--border); margin: 0.5em 0;
      padding: 3px 14px; color: var(--text-soft); font-size: 0.88rem;
      background: var(--surface); border-radius: 0 8px 8px 0;
    }}
    .md-content hr {{ border: none; border-top: 1px solid var(--border); margin: 1em 0; }}
    .md-content a {{ color: var(--text-soft); }}

    /* Charts */
    .charts-grid {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }}
    .chart-full  {{ grid-column: 1 / -1; }}
    .chart-half  {{ grid-column: span 1; }}
    .chart-wrap {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px 24px;
    }}
    .chart-label {{
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-soft);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 16px;
    }}
    .chart-wrap canvas {{ max-height: 260px; }}
    #chartPie {{ max-height: 320px; }}
    .empty-state {{
      text-align: center; color: var(--text-soft);
      padding: 40px; font-size: 0.9rem;
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
    .net-pop-row {{ display: flex; justify-content: space-between; gap: 16px;
      font-size: 0.78rem; color: var(--text-soft); margin-top: 2px; }}
    .net-pop-link {{
      display: inline-block; margin-top: 8px; font-size: 0.78rem; font-weight: 600;
      color: var(--text-soft); text-decoration: underline; cursor: pointer; padding: 2px 0;
    }}
    .net-pop-link:hover {{ color: var(--text); }}
    .net-legend {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }}
    .net-legend-item {{ display: flex; align-items: center; gap: 6px;
      font-size: 0.75rem; color: var(--text-soft); }}
    .net-legend-dot {{ width: 12px; height: 12px; border-radius: 50%;
      border: 1px solid var(--border); flex-shrink: 0; }}

    /* Router table */
    .router-table {{ width: 100%; border-collapse: collapse; font-size: 0.9rem; }}
    .router-table th, .router-table td {{
      text-align: left; padding: 10px 14px;
      border-bottom: 1px solid var(--border);
    }}
    .router-table th {{
      color: var(--text-soft); font-weight: 600;
      text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;
      background: var(--surface);
    }}
    .router-table tr:last-child td {{ border-bottom: none; }}
    .router-table tr:hover td {{ background: var(--surface); }}
    .router-table code {{
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 6px; padding: 1px 7px; font-size: 0.82em;
      font-family: 'SFMono-Regular', Consolas, monospace;
    }}

    /* Footer */
    footer {{
      text-align: center; color: var(--text-soft);
      font-size: 0.82rem; padding: 32px 24px;
      border-top: 1px solid var(--border);
    }}
  </style>
</head>
<body>

<header>
  <div class="header-title">
    <img src="logo.png" alt="FUSE" class="header-logo" />
    <h1>FUSE — AI Engineering Dashboard</h1>
    <span class="badge">LIVE</span>
  </div>
  <nav>
    <a href="#network">Network</a>
    <a href="#tokens">Tokens</a>
    <a href="#agents">Agents</a>
    <a href="#docs">Docs</a>
    <a href="#router">Routing</a>
    <a href="analytics.html">Analytics →</a>
  </nav>
</header>

<!-- Modal -->
<div class="modal-backdrop" id="modal-backdrop">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-header-left">
        <span class="modal-title" id="modal-title"></span>
        <span id="modal-badge"></span>
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
      <div class="chart-label">Click a node to open its documentation · Drag to rearrange</div>
      <div id="network-graph"></div>
      <div class="net-legend" id="net-legend"></div>
    </div>
  </section>

  <section id="tokens">
    <div class="section-title">Token Usage</div>
    <div class="charts-grid">
      <!-- Row 1: Daily bar chart full width -->
      <div class="chart-wrap chart-full">
        <div class="chart-label">Daily Usage — Last 7 Days (total tokens)</div>
        <canvas id="chartDaily"></canvas>
        <div class="empty-state" id="token-empty" style="display:none">No token data yet.</div>
      </div>
      <!-- Row 2: Pie full width -->
      <div class="chart-wrap chart-full">
        <div class="chart-label">Remote vs Local Share</div>
        <canvas id="chartPie"></canvas>
      </div>
      <!-- Row 3: Remote + Local side by side -->
      <div class="chart-wrap chart-half">
        <div class="chart-label">Remote LLM (Claude) — Breakdown</div>
        <canvas id="chartRemote"></canvas>
      </div>
      <div class="chart-wrap chart-half">
        <div class="chart-label">Local LLM (Ollama) — Breakdown</div>
        <canvas id="chartLocal"></canvas>
      </div>
    </div>
  </section>

  <section id="agents">
    <div class="section-title">AI Agents</div>
    <div class="card-grid" id="agent-grid">
      <div class="empty-state">Loading…</div>
    </div>
  </section>

  <section id="docs">
    <div class="section-title">Documentation</div>
    <div id="doc-groups"></div>
  </section>

  <section id="router">
    <div class="section-title">LLM Routing Strategy</div>
    <table class="router-table">
      <thead>
        <tr><th>Model</th><th>Type</th><th>Cost</th><th>Used for</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><code>claude-sonnet-4-6</code></td>
          <td>Remote</td><td>Per token</td>
          <td>Architecture, review, debug, refactor, tradeoffs</td>
        </tr>
        <tr>
          <td><code>qwen2.5-coder:14b</code></td>
          <td>Local (Ollama)</td><td>Zero</td>
          <td>Tests, boilerplate, translations, mechanical tasks</td>
        </tr>
      </tbody>
    </table>
  </section>

</main>

<footer>
  Generated: {now} &nbsp;·&nbsp;
  <a href="https://github.com/eugenioduarte/FUSE">eugenioduarte/FUSE</a>
</footer>

<script id="dashboard-data" type="application/json">
{payload}
</script>

<script>
(function () {{
  const data     = JSON.parse(document.getElementById('dashboard-data').textContent);
  const backdrop = document.getElementById('modal-backdrop');
  const modalTitle   = document.getElementById('modal-title');
  const modalBadge   = document.getElementById('modal-badge');
  const modalContent = document.getElementById('modal-content');

  // ── Modal ────────────────────────────────────────────────────────────────
  function openModal(name, badgeHtml, markdown) {{
    modalTitle.textContent = name;
    modalBadge.innerHTML   = badgeHtml;
    modalContent.innerHTML = marked.parse(markdown || '');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    backdrop.querySelector('.modal-body').scrollTop = 0;
  }}
  function closeModal() {{
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }}
  document.getElementById('modal-close').addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => {{ if (e.target === backdrop) closeModal(); }});
  document.addEventListener('keydown', e => {{ if (e.key === 'Escape') closeModal(); }});

  function routingBadgeHtml(routing) {{
    const label = routing === 'remote' ? 'Remote' : routing === 'local' ? 'Local' : 'Conditional';
    return `<span class="routing-badge routing-${{routing}}">${{label}}</span>`;
  }}

  // ── Agent cards ──────────────────────────────────────────────────────────
  const grid = document.getElementById('agent-grid');
  if (!data.agents || data.agents.length === 0) {{
    grid.innerHTML = '<div class="empty-state">No agents found in .ai/agents/</div>';
  }} else {{
    grid.innerHTML = data.agents.map((a, i) => `
      <div class="agent-card" data-type="agent" data-idx="${{i}}" tabindex="0" role="button">
        <div class="card-header">
          <span class="card-name">${{a.name}}</span>
          ${{routingBadgeHtml(a.routing)}}
        </div>
        <div class="card-desc">${{a.role}}</div>
        <div class="card-model">${{a.model}}</div>
        <div class="card-hint">Click to read full spec</div>
      </div>
    `).join('');
    grid.querySelectorAll('.agent-card').forEach(card => {{
      const open = () => {{
        const a = data.agents[+card.dataset.idx];
        openModal(a.name, routingBadgeHtml(a.routing), a.markdown);
      }};
      card.addEventListener('click', open);
      card.addEventListener('keydown', e => {{ if (e.key === 'Enter' || e.key === ' ') open(); }});
    }});
  }}

  // ── Doc groups ───────────────────────────────────────────────────────────
  const docContainer = document.getElementById('doc-groups');
  if (!data.docGroups || data.docGroups.length === 0) {{
    docContainer.innerHTML = '<div class="empty-state">No documentation found.</div>';
  }} else {{
    let allDocs = [];
    data.docGroups.forEach(group => {{
      const startIdx = allDocs.length;
      allDocs = allDocs.concat(group.docs);
      const label = document.createElement('div');
      label.className = 'subsection-label';
      label.textContent = group.label;
      docContainer.appendChild(label);

      const g = document.createElement('div');
      g.className = 'card-grid';
      g.innerHTML = group.docs.map((d, localIdx) => `
        <div class="doc-card" data-docidx="${{startIdx + localIdx}}" tabindex="0" role="button">
          <div class="card-header">
            <span class="card-name">${{d.name}}</span>
            <span class="folder-badge">${{group.label}}</span>
          </div>
          <div class="card-desc">${{d.desc}}</div>
          <div class="card-hint">Click to read</div>
        </div>
      `).join('');
      docContainer.appendChild(g);

      g.querySelectorAll('.doc-card').forEach(card => {{
        const open = () => {{
          const d = allDocs[+card.dataset.docidx];
          openModal(d.name, `<span class="folder-badge">${{group.label}}</span>`, d.markdown);
        }};
        card.addEventListener('click', open);
        card.addEventListener('keydown', e => {{ if (e.key === 'Enter' || e.key === ' ') open(); }});
      }});
    }});
  }}

  // ── Token charts ─────────────────────────────────────────────────────────
  const tokenData   = data.tokenUsage  || [];
  const tokenTotals = data.tokenTotals || {{ claude: {{}}, ollama: {{}} }};
  const chartFont   = {{ family: 'Fredoka', size: 13 }};
  const axisColor   = '#5A2E3D';
  const gridColor   = 'rgba(58,0,29,0.08)';
  const fmt         = n => (n || 0).toLocaleString();

  // 1 — Daily bar chart (last 7 days)
  if (tokenData.length === 0) {{
    document.getElementById('chartDaily').style.display = 'none';
    document.getElementById('token-empty').style.display = 'block';
  }} else {{
    new Chart(document.getElementById('chartDaily'), {{
      type: 'bar',
      data: {{
        labels: tokenData.map(d => d.date),
        datasets: [
          {{ label: 'Remote (Claude)', data: tokenData.map(d => d.claude), backgroundColor: 'rgba(174,227,243,0.85)', borderColor: '#3A001D', borderWidth: 1, borderRadius: 6 }},
          {{ label: 'Local (Ollama)',  data: tokenData.map(d => d.ollama), backgroundColor: 'rgba(188,235,203,0.85)', borderColor: '#3A001D', borderWidth: 1, borderRadius: 6 }},
        ],
      }},
      options: {{
        responsive: true,
        plugins: {{
          legend: {{ labels: {{ color: axisColor, font: chartFont }} }},
          tooltip: {{ callbacks: {{ label: ctx => ` ${{ctx.dataset.label}}: ${{fmt(ctx.parsed.y)}} tokens` }} }},
        }},
        scales: {{
          x: {{ stacked: true, ticks: {{ color: axisColor, font: chartFont }}, grid: {{ color: gridColor }} }},
          y: {{ stacked: true, ticks: {{ color: axisColor, font: chartFont }}, grid: {{ color: gridColor }} }},
        }},
      }},
    }});
  }}

  // 2 — Pie chart (remote vs local share)
  const totalClaude = tokenTotals.claude.total || 0;
  const totalOllama = tokenTotals.ollama.total || 0;
  if (totalClaude + totalOllama > 0) {{
    new Chart(document.getElementById('chartPie'), {{
      type: 'doughnut',
      data: {{
        labels: ['Remote (Claude)', 'Local (Ollama)'],
        datasets: [{{
          data: [totalClaude, totalOllama],
          backgroundColor: ['rgba(174,227,243,0.9)', 'rgba(188,235,203,0.9)'],
          borderColor: '#3A001D',
          borderWidth: 1,
        }}],
      }},
      options: {{
        responsive: true,
        plugins: {{
          legend: {{ labels: {{ color: axisColor, font: chartFont }} }},
          tooltip: {{ callbacks: {{ label: ctx => ` ${{ctx.label}}: ${{fmt(ctx.parsed)}} tokens` }} }},
        }},
      }},
    }});
  }}

  // helper: breakdown bar chart (input / output / cache / total)
  function makeBreakdownChart(canvasId, t, color) {{
    if (!t || !t.total) return;
    new Chart(document.getElementById(canvasId), {{
      type: 'bar',
      data: {{
        labels: ['Input', 'Output', 'Cache Read', 'Total'],
        datasets: [{{
          label: 'Tokens',
          data: [t.input || 0, t.output || 0, t.cache || 0, t.total || 0],
          backgroundColor: color,
          borderColor: '#3A001D',
          borderWidth: 1,
          borderRadius: 6,
        }}],
      }},
      options: {{
        responsive: true,
        plugins: {{
          legend: {{ display: false }},
          tooltip: {{ callbacks: {{ label: ctx => ` ${{fmt(ctx.parsed.y)}} tokens` }} }},
        }},
        scales: {{
          x: {{ ticks: {{ color: axisColor, font: chartFont }}, grid: {{ color: gridColor }} }},
          y: {{ ticks: {{ color: axisColor, font: chartFont }}, grid: {{ color: gridColor }} }},
        }},
      }},
    }});
  }}

  // 3 — Remote breakdown
  makeBreakdownChart('chartRemote', tokenTotals.claude, 'rgba(174,227,243,0.85)');
  // 4 — Local breakdown
  makeBreakdownChart('chartLocal',  tokenTotals.ollama, 'rgba(188,235,203,0.85)');

  // ── Agent Network Graph (D3 force-directed) — identical to analytics ─────
  (function renderNetwork() {{
    const net = data.agentNetwork;
    if (!net || !net.nodes || net.nodes.length === 0) return;

    const agentMap = {{}};
    (data.agents || []).forEach(a => {{ agentMap[a.name] = a; }});

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

    function fmtNum(n) {{
      if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+'M';
      if (n >= 1_000) return (n/1_000).toFixed(1)+'K';
      return String(n);
    }}

    // Legend
    const legendEl = document.getElementById('net-legend');
    Object.entries(TYPE_COLOR).forEach(([type, color]) => {{
      if (type === 'other') return;
      legendEl.innerHTML += `<div class="net-legend-item">
        <div class="net-legend-dot" style="background:${{color}}"></div>
        <span>${{type}}</span></div>`;
    }});
    legendEl.innerHTML += `
      <div class="net-legend-item" style="margin-left:12px">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(58,0,29,0.4)" stroke-width="1.5"/></svg>
        <span>flow</span></div>
      <div class="net-legend-item">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(242,150,184,0.85)" stroke-width="1.5"/></svg>
        <span>retry</span></div>
      <div class="net-legend-item">
        <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="rgba(174,227,243,0.8)" stroke-width="1.5" stroke-dasharray="4,3"/></svg>
        <span>dependency</span></div>`;

    const svg = d3.select(container).append('svg')
      .attr('width', W).attr('height', H).style('background', 'transparent');

    const defs = svg.append('defs');
    Object.entries(EDGE_COLOR).forEach(([type, color]) => {{
      defs.append('marker')
        .attr('id', `arrow-${{type}}`)
        .attr('viewBox', '0 -4 8 8').attr('refX', 18).attr('refY', 0)
        .attr('markerWidth', 6).attr('markerHeight', 6).attr('orient', 'auto')
        .append('path').attr('d', 'M0,-4L8,0L0,4')
        .attr('fill', color.slice(0, color.lastIndexOf(',')) + ',0.9)');
    }});

    const maxTokens = Math.max(...net.nodes.map(n => n.tokens || 0), 1);
    const radius = n => Math.max(9, Math.min(28, 9 + Math.sqrt((n.tokens || 0) / Math.max(maxTokens / 400, 1))));

    const neighbors = {{}};
    net.nodes.forEach(n => {{ neighbors[n.id] = new Set(); }});
    net.edges.forEach(e => {{
      neighbors[e.source]?.add(e.target);
      neighbors[e.target]?.add(e.source);
    }});

    const nodes = net.nodes.map(n => ({{...n}}));
    const edges = net.edges.map(e => ({{...e}}));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(edges).id(n => n.id).distance(130).strength(0.6))
      .force('charge', d3.forceManyBody().strength(-450))
      .force('center', d3.forceCenter(W / 2, H / 2).strength(0.05))
      .force('collision', d3.forceCollide().radius(n => radius(n) + 18));

    const linkGroup = svg.append('g');
    const nodeGroup = svg.append('g');

    const link = linkGroup.selectAll('line').data(edges).enter().append('line')
      .attr('class', 'net-link')
      .attr('stroke', e => EDGE_COLOR[e.edgeType] || EDGE_COLOR.flow)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', e => e.edgeType === 'dependency' ? '5,3' : null)
      .attr('marker-end', e => `url(#arrow-${{e.edgeType}})`);

    const node = nodeGroup.selectAll('g').data(nodes).enter().append('g')
      .attr('class', 'net-node')
      .call(d3.drag()
        .on('start', (ev, n) => {{ if (!ev.active) sim.alphaTarget(0.3).restart(); n.fx = n.x; n.fy = n.y; }})
        .on('drag',  (ev, n) => {{ n.fx = ev.x; n.fy = ev.y; }})
        .on('end',   (ev, n) => {{ if (!ev.active) sim.alphaTarget(0); n.fx = null; n.fy = null; }})
      );

    node.append('circle')
      .attr('r', radius)
      .attr('fill', n => TYPE_COLOR[n.type] || TYPE_COLOR.other)
      .attr('stroke', '#3A001D').attr('stroke-width', 1);

    node.append('text')
      .attr('class', 'net-label')
      .attr('text-anchor', 'middle')
      .attr('dy', n => radius(n) + 13)
      .attr('font-family', 'Fredoka, sans-serif').attr('font-size', 11).attr('fill', '#5A2E3D')
      .text(n => n.label);

    sim.on('tick', () => {{
      link.attr('x1', e => e.source.x).attr('y1', e => e.source.y)
          .attr('x2', e => e.target.x).attr('y2', e => e.target.y);
      node.attr('transform', n => `translate(${{n.x}},${{n.y}})`);
    }});

    const popover = document.createElement('div');
    popover.className = 'net-popover';
    document.body.appendChild(popover);
    popover.addEventListener('click', e => e.stopPropagation());

    let selected = null;

    node.on('click', function(event, n) {{
      event.stopPropagation();
      if (selected === n.id) {{
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

      const ag = agentMap[n.id];
      popover.innerHTML = `
        <strong>${{n.label}}</strong>
        <div class="net-pop-row"><span>Type</span><span>${{n.type}}</span></div>
        <div class="net-pop-row"><span>Tokens</span><span>${{fmtNum(n.tokens || 0)}}</span></div>
        <div class="net-pop-row"><span>Connections</span><span>${{connected.size}}</span></div>
        ${{ag ? `<span class="net-pop-link">View agent docs →</span>` : ''}}`;

      popover.querySelector('.net-pop-link')?.addEventListener('click', () => {{
        if (ag) openModal(ag.name, routingBadgeHtml(ag.routing), ag.markdown);
      }});

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
</html>
'''

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'✅ Dashboard generated: {out_path}')
print(f'   Agents: {len(agents)}')
print(f'   Doc groups: {len(doc_groups)} ({sum(len(g["docs"]) for g in doc_groups)} docs)')
print(f'   Token days: {len(token_data)}')
PYEOF
