#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$REPO_ROOT/docs/ai-system.html"

python3 - "$REPO_ROOT" "$OUT" <<'PYEOF'
import json
import os
import sys
from datetime import datetime

repo_root = sys.argv[1]
out_path = sys.argv[2]

def read(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()

def parse_frontmatter(path):
    text = read(path)
    meta = {}
    if text.startswith("---\n"):
        front, _ = text.split("\n---\n", 1)
        current_list = None
        for line in front.splitlines()[1:]:
            if not line.strip():
                continue
            if line.startswith("  - ") and current_list:
                value = line.replace("  - ", "").strip().strip('"')
                meta.setdefault(current_list, []).append(value)
                continue
            if ":" in line:
                key, value = line.split(":", 1)
                key = key.strip()
                value = value.strip().strip('"')
                if value:
                    meta[key] = value
                    current_list = None
                else:
                    meta[key] = []
                    current_list = key
    return meta

claude_root = os.path.join(repo_root, ".claude")
agents_dir = os.path.join(claude_root, "agents")
skills_dir = os.path.join(claude_root, "skills")
rules_dir = os.path.join(claude_root, "rules")
memory_dir = os.path.join(claude_root, "agent-memory")

agents = []
for name in sorted(os.listdir(agents_dir)):
    if name.endswith(".md"):
        meta = parse_frontmatter(os.path.join(agents_dir, name))
        agents.append({
            "name": meta.get("name", name[:-3]),
            "model": meta.get("model", "unspecified"),
            "tools": meta.get("tools", "Read"),
            "skills": meta.get("skills", []),
            "description": meta.get("description", "")
        })

skills = []
for name in sorted(os.listdir(skills_dir)):
    path = os.path.join(skills_dir, name, "SKILL.md")
    if os.path.exists(path):
        meta = parse_frontmatter(path)
        skills.append({
            "name": meta.get("name", name),
            "description": meta.get("description", ""),
            "context": meta.get("context", "inline"),
            "tools": meta.get("allowed-tools", "Read")
        })

rules = []
for name in sorted(os.listdir(rules_dir)):
    if name.endswith(".md"):
        meta = parse_frontmatter(os.path.join(rules_dir, name))
        paths = meta.get("paths", [])
        if isinstance(paths, str):
            paths = [paths]
        rules.append({"name": name[:-3], "paths": paths})

memory = []
for name in sorted(os.listdir(memory_dir)):
    readme = os.path.join(memory_dir, name, "README.md")
    summary = read(readme).strip() if os.path.exists(readme) else ""
    memory.append({"name": name, "summary": summary})

generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
payload = json.dumps({
    "generatedAt": generated_at,
    "agents": agents,
    "skills": skills,
    "rules": rules,
    "memory": memory,
}, ensure_ascii=False)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE - AI System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {{ --bg:#fff8ee; --surface:#f3ead9; --panel:#fffdf8; --ink:#201533; --muted:#6d596d; --border:#38213a; --accent:#efb366; --accent2:#c8e7cb; --accent3:#bfe0ee; --radius:16px; }}
    * {{ box-sizing:border-box; }} body {{ margin:0; font-family:'Fredoka',sans-serif; background:linear-gradient(180deg,#fff9f1 0%,#f4ecdf 100%); color:var(--ink); }}
    header {{ padding:24px; border-bottom:1px solid var(--border); background:rgba(255,248,238,.94); position:sticky; top:0; }}
    nav a {{ margin-right:10px; color:var(--ink); text-decoration:none; border:1px solid var(--border); border-radius:999px; padding:6px 12px; background:#fffaf3; }}
    main {{ max-width:1180px; margin:0 auto; padding:30px 20px 60px; }}
    section {{ margin-top:18px; }}
    .hero,.panel {{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px; }}
    .badge {{ display:inline-block; margin-bottom:8px; padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:var(--accent); font-size:12px; font-weight:600; }}
    .meta {{ color:var(--muted); }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; }}
    .card {{ background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    h1,h2,h3,p,ul {{ margin:0; }} h1 {{ font-size:34px; }} h2 {{ font-size:18px; margin-bottom:12px; }} h3 {{ font-size:16px; margin-bottom:8px; }}
    ul {{ padding-left:18px; margin-top:8px; color:var(--muted); line-height:1.5; }}
    table {{ width:100%; border-collapse:collapse; }} th,td {{ text-align:left; padding:10px 8px; border-bottom:1px solid rgba(56,33,58,.16); vertical-align:top; }}
    th {{ font-size:12px; color:var(--muted); text-transform:uppercase; }}
    .timeline {{ display:grid; gap:10px; }}
    .event {{ border-left:4px solid var(--border); padding:8px 0 8px 14px; }}
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="./index.html">Home</a>
      <a href="./demonstration-orchestration.html">Orchestration</a>
      <a href="./analytics.html">Analytics</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <span class="badge">Enterprise Skills-First architecture</span>
      <h1>FUSE AI System</h1>
      <p class="meta">The active system is rooted in <code>.claude/</code> and separates policy, rules, reusable skills, and execution agents. Generated at {generated_at}.</p>
    </section>
    <section class="panel">
      <h2>Architecture Flow</h2>
      <table>
        <tr><th>Layer</th><th>Purpose</th></tr>
        <tr><td>CLAUDE.md</td><td>Identity, routing policy, critical invariants.</td></tr>
        <tr><td>Rules</td><td>Path-scoped guardrails activated by touched files.</td></tr>
        <tr><td>Skills</td><td>Reusable knowledge and templates loaded on demand.</td></tr>
        <tr><td>Agents</td><td>Execution roles with bounded tools and models.</td></tr>
        <tr><td>Agent memory</td><td>Persistent role-level learning boundary.</td></tr>
      </table>
    </section>
    <section class="panel">
      <h2>Agents</h2>
      <table id="agentsTable">
        <thead><tr><th>Name</th><th>Model</th><th>Tools</th><th>Skills</th><th>Description</th></tr></thead>
        <tbody></tbody>
      </table>
    </section>
    <section class="panel">
      <h2>Skills Catalog</h2>
      <div class="grid" id="skills"></div>
    </section>
    <section class="panel">
      <h2>Rules Map</h2>
      <div class="grid" id="rules"></div>
    </section>
    <section class="panel">
      <h2>Memory Readiness</h2>
      <div class="grid" id="memory"></div>
    </section>
    <section class="panel">
      <h2>Migration Timeline</h2>
      <div class="timeline">
        <div class="event"><strong>v1</strong> - multi-agent experimental generation.</div>
        <div class="event"><strong>v2</strong> - consolidated `.ai/` orchestrator with seven agents.</div>
        <div class="event"><strong>v3</strong> - `.claude/` Skills-First enterprise architecture with generated documentation.</div>
      </div>
    </section>
  </main>
  <script id="payload" type="application/json">{payload}</script>
  <script>
    const data = JSON.parse(document.getElementById('payload').textContent);
    const agentsBody = document.querySelector('#agentsTable tbody');
    data.agents.forEach((agent) => {{
      const tr = document.createElement('tr');
      const skills = Array.isArray(agent.skills) ? agent.skills.join(', ') : agent.skills;
      tr.innerHTML = `<td>${{agent.name}}</td><td>${{agent.model}}</td><td>${{agent.tools}}</td><td>${{skills}}</td><td>${{agent.description}}</td>`;
      agentsBody.appendChild(tr);
    }});
    const skillsRoot = document.getElementById('skills');
    data.skills.forEach((skill) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{skill.name}}</h3><p class="meta">${{skill.description}}</p><ul><li>Context: ${{skill.context}}</li><li>Tools: ${{skill.tools}}</li></ul>`;
      skillsRoot.appendChild(el);
    }});
    const rulesRoot = document.getElementById('rules');
    data.rules.forEach((rule) => {{
      const el = document.createElement('article');
      el.className = 'card';
      const paths = (rule.paths || []).map((p) => `<li>${{p}}</li>`).join('');
      el.innerHTML = `<h3>${{rule.name}}</h3><ul>${{paths}}</ul>`;
      rulesRoot.appendChild(el);
    }});
    const memoryRoot = document.getElementById('memory');
    data.memory.forEach((entry) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{entry.name}}</h3><p class="meta">${{entry.summary}}</p>`;
      memoryRoot.appendChild(el);
    }});
  </script>
</body>
</html>"""

with open(out_path, "w", encoding="utf-8") as fh:
    fh.write(html)
PYEOF
