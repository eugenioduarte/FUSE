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

daily = defaultdict(lambda: {'claude': 0, 'ollama': 0, 'total': 0})
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
            provider = parts[2].lower()
            total    = int(parts[7])
            if provider == 'claude':
                daily[date]['claude'] += total
            else:
                daily[date]['ollama'] += total
            daily[date]['total'] += total
except FileNotFoundError:
    pass
except Exception as e:
    print(f'⚠️  CSV error: {e}', file=sys.stderr)

token_data = [
    {'date': d, 'claude': v['claude'], 'ollama': v['ollama'], 'total': v['total']}
    for d, v in sorted(daily.items())
]

# ── JSON payload ─────────────────────────────────────────────────────────────

payload = json.dumps({
    'generatedAt': now,
    'agents': agents,
    'docGroups': doc_groups,
    'tokenUsage': token_data,
}, ensure_ascii=False, indent=2)

# ── HTML ─────────────────────────────────────────────────────────────────────

html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE — AI Engineering Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@9/marked.min.js"></script>
  <style>
    :root {{
      --bg: #0d1117;
      --surface: #161b22;
      --border: #30363d;
      --text: #e6edf3;
      --muted: #8b949e;
      --blue: #388bfd;
      --green: #3fb950;
      --yellow: #d29922;
      --purple: #bc8cff;
      --orange: #f0883e;
      --radius: 8px;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }}
    a {{ color: var(--blue); text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}

    /* Header */
    header {{
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }}
    .header-title {{ display: flex; align-items: center; gap: 12px; }}
    .header-title h1 {{ font-size: 1.1rem; font-weight: 600; }}
    .header-title .badge {{
      background: var(--blue); color: #fff;
      font-size: 0.7rem; padding: 2px 8px;
      border-radius: 12px; font-weight: 600;
    }}
    nav {{ display: flex; gap: 20px; font-size: 0.9rem; flex-wrap: wrap; }}
    nav a {{ color: var(--muted); }}
    nav a:hover {{ color: var(--text); text-decoration: none; }}

    /* Layout */
    main {{ max-width: 1100px; margin: 0 auto; padding: 40px 24px; }}
    section {{ margin-bottom: 60px; }}
    .section-title {{
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.8rem;
    }}
    .subsection-label {{
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 24px 0 10px;
    }}
    .subsection-label:first-child {{ margin-top: 0; }}

    /* Card grid */
    .card-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 12px;
    }}

    /* Agent card */
    .agent-card, .doc-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }}
    .agent-card:hover, .doc-card:hover {{
      border-color: var(--blue);
      background: #1c2230;
    }}
    .card-header {{ display: flex; align-items: center; justify-content: space-between; gap: 8px; }}
    .card-name {{ font-weight: 600; font-size: 0.9rem; font-family: monospace; word-break: break-all; }}
    .routing-badge {{
      flex-shrink: 0;
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }}
    .routing-remote      {{ background: rgba(56,139,253,0.2);  color: var(--blue);   }}
    .routing-local       {{ background: rgba(63,185,80,0.2);   color: var(--green);  }}
    .routing-conditional {{ background: rgba(210,153,34,0.2);  color: var(--yellow); }}
    .card-desc  {{ font-size: 0.83rem; color: var(--muted); }}
    .card-model {{ font-size: 0.72rem; color: var(--purple); font-family: monospace; }}
    .card-hint  {{ font-size: 0.7rem; color: #444d56; margin-top: 2px; }}

    /* Doc folder badge */
    .folder-badge {{
      flex-shrink: 0;
      font-size: 0.65rem;
      padding: 2px 7px;
      border-radius: 12px;
      font-weight: 600;
      background: rgba(240,136,62,0.15);
      color: var(--orange);
    }}

    /* Modal */
    .modal-backdrop {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      z-index: 100;
      backdrop-filter: blur(3px);
    }}
    .modal-backdrop.open {{ display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; }}
    .modal {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
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
    }}
    .modal-header-left {{ display: flex; align-items: center; gap: 10px; min-width: 0; }}
    .modal-title {{ font-weight: 600; font-family: monospace; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }}
    .modal-close {{
      flex-shrink: 0;
      background: none; border: none;
      color: var(--muted); font-size: 1.3rem;
      cursor: pointer; line-height: 1; padding: 0 2px;
    }}
    .modal-close:hover {{ color: var(--text); }}
    .modal-body {{ overflow-y: auto; padding: 28px 32px; flex: 1; }}

    /* Markdown styles */
    .md-content h1, .md-content h2, .md-content h3, .md-content h4 {{
      margin: 1.3em 0 0.45em; font-weight: 600; line-height: 1.3;
    }}
    .md-content h1 {{ font-size: 1.3rem; border-bottom: 1px solid var(--border); padding-bottom: 8px; }}
    .md-content h2 {{ font-size: 1.05rem; border: none; text-transform: none; letter-spacing: 0; padding: 0; color: var(--text); }}
    .md-content h3 {{ font-size: 0.92rem; color: var(--muted); }}
    .md-content h4 {{ font-size: 0.85rem; color: var(--muted); }}
    .md-content p  {{ margin: 0.55em 0; font-size: 0.88rem; color: #cdd5df; }}
    .md-content ul, .md-content ol {{ padding-left: 1.4em; margin: 0.4em 0; }}
    .md-content li {{ font-size: 0.88rem; color: #cdd5df; margin: 2px 0; }}
    .md-content code {{
      background: #0d1117; border: 1px solid var(--border);
      border-radius: 4px; padding: 1px 6px;
      font-size: 0.83em; color: var(--purple);
      font-family: 'SFMono-Regular', Consolas, monospace;
    }}
    .md-content pre {{
      background: #0d1117; border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px;
      overflow-x: auto; margin: 0.7em 0;
    }}
    .md-content pre code {{
      background: none; border: none; padding: 0;
      color: #e6edf3; font-size: 0.82rem;
    }}
    .md-content table {{
      width: 100%; border-collapse: collapse;
      font-size: 0.83rem; margin: 0.7em 0;
    }}
    .md-content th, .md-content td {{
      padding: 7px 11px; border: 1px solid var(--border); text-align: left;
    }}
    .md-content th {{ background: #0d1117; color: var(--muted); font-weight: 600; }}
    .md-content blockquote {{
      border-left: 3px solid var(--border); margin: 0.5em 0;
      padding: 3px 14px; color: var(--muted); font-size: 0.86rem;
    }}
    .md-content hr {{ border: none; border-top: 1px solid var(--border); margin: 1em 0; }}
    .md-content a {{ color: var(--blue); }}

    /* Chart */
    .chart-wrap {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
    }}
    .chart-wrap canvas {{ max-height: 300px; }}
    .empty-state {{
      text-align: center; color: var(--muted);
      padding: 40px; font-size: 0.9rem;
    }}

    /* Router table */
    .router-table {{ width: 100%; border-collapse: collapse; font-size: 0.88rem; }}
    .router-table th, .router-table td {{
      text-align: left; padding: 10px 14px;
      border-bottom: 1px solid var(--border);
    }}
    .router-table th {{
      color: var(--muted); font-weight: 600;
      text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.04em;
    }}
    .router-table tr:last-child td {{ border-bottom: none; }}
    .router-table tr:hover td {{ background: rgba(255,255,255,0.02); }}

    /* Footer */
    footer {{
      text-align: center; color: var(--muted);
      font-size: 0.8rem; padding: 32px 24px;
      border-top: 1px solid var(--border);
    }}
  </style>
</head>
<body>

<header>
  <div class="header-title">
    <h1>FUSE — AI Engineering Dashboard</h1>
    <span class="badge">LIVE</span>
  </div>
  <nav>
    <a href="#agents">Agents</a>
    <a href="#docs">Docs</a>
    <a href="#tokens">Tokens</a>
    <a href="#router">Routing</a>
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

  <section id="tokens">
    <div class="section-title">Token Usage</div>
    <div class="chart-wrap">
      <canvas id="tokenChart"></canvas>
      <div class="empty-state" id="token-empty" style="display:none">
        No token data yet. Usage will appear after the first Claude session.
      </div>
    </div>
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

  // ── Token chart ──────────────────────────────────────────────────────────
  const tokenData = data.tokenUsage || [];
  if (tokenData.length === 0) {{
    document.getElementById('tokenChart').style.display = 'none';
    document.getElementById('token-empty').style.display = 'block';
  }} else {{
    new Chart(document.getElementById('tokenChart'), {{
      type: 'bar',
      data: {{
        labels: tokenData.map(d => d.date),
        datasets: [
          {{ label: 'Claude (remote)', data: tokenData.map(d => d.claude), backgroundColor: 'rgba(56,139,253,0.7)', borderRadius: 4 }},
          {{ label: 'Ollama (local)',  data: tokenData.map(d => d.ollama), backgroundColor: 'rgba(63,185,80,0.7)',  borderRadius: 4 }},
        ],
      }},
      options: {{
        responsive: true,
        plugins: {{
          legend: {{ labels: {{ color: '#8b949e' }} }},
          tooltip: {{ callbacks: {{ label: ctx => ` ${{ctx.dataset.label}}: ${{ctx.parsed.y.toLocaleString()}} tokens` }} }},
        }},
        scales: {{
          x: {{ stacked: true, ticks: {{ color: '#8b949e' }}, grid: {{ color: '#21262d' }} }},
          y: {{ stacked: true, ticks: {{ color: '#8b949e' }}, grid: {{ color: '#21262d' }} }},
        }},
      }},
    }});
  }}
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
