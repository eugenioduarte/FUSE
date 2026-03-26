#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$REPO_ROOT/docs/demonstration-orchestration.html"

python3 - "$REPO_ROOT" "$OUT" <<'PYEOF'
import json
import os
import re
import sys
from datetime import datetime

repo_root = sys.argv[1]
out_path = sys.argv[2]


def read(path):
    with open(path, "r", encoding="utf-8") as fh:
        return fh.read()


def compact(text):
    return re.sub(r"\s+", " ", text).strip()


def parse_frontmatter(path):
    text = read(path)
    meta = {}
    body = text
    if text.startswith("---\n"):
        _, rest = text.split("---\n", 1)
        front, body = rest.split("\n---\n", 1)
        current_list = None
        for raw_line in front.splitlines():
            line = raw_line.rstrip()
            if not line.strip():
                continue
            if line.lstrip().startswith("- ") and current_list:
                meta.setdefault(current_list, []).append(line.split("- ", 1)[1].strip().strip('"'))
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
    return meta, body.strip()


def first_sentence(text):
    clean = compact(text)
    if not clean:
        return ""
    return clean.split(". ", 1)[0]


agents_dir = os.path.join(repo_root, ".claude", "agents")
skills_dir = os.path.join(repo_root, ".claude", "skills")
rules_dir = os.path.join(repo_root, ".claude", "rules")
commands_dir = os.path.join(repo_root, ".claude", "commands")
observability_dir = os.path.join(repo_root, ".claude", "observability")
sdd_dir = os.path.join(repo_root, ".claude", "sdd")

agents = []
for name in sorted(os.listdir(agents_dir)):
    if not name.endswith(".md"):
        continue
    meta, body = parse_frontmatter(os.path.join(agents_dir, name))
    agents.append(
        {
            "name": meta.get("name", name[:-3]),
            "description": meta.get("description", first_sentence(body)),
            "model": meta.get("model", "unspecified"),
            "tools": [item.strip() for item in meta.get("tools", "Read").split(",") if item.strip()],
            "skills": meta.get("skills", []),
        }
    )

skills = []
for name in sorted(os.listdir(skills_dir)):
    path = os.path.join(skills_dir, name, "SKILL.md")
    if not os.path.exists(path):
        continue
    meta, body = parse_frontmatter(path)
    skills.append(
        {
            "name": meta.get("name", name),
            "description": meta.get("description", first_sentence(body)),
            "context": meta.get("context", "inline"),
            "tools": [item.strip() for item in meta.get("allowed-tools", "Read").split(",") if item.strip()],
        }
    )

rules = []
for name in sorted(os.listdir(rules_dir)):
    if not name.endswith(".md"):
        continue
    meta, body = parse_frontmatter(os.path.join(rules_dir, name))
    paths = meta.get("paths", [])
    if isinstance(paths, str):
        paths = [paths]
    rules.append(
        {
            "name": name[:-3],
            "paths": paths,
            "summary": first_sentence(body),
        }
    )

generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
counts = {
    "commands": len([name for name in os.listdir(commands_dir) if name.endswith(".md")]) if os.path.isdir(commands_dir) else 0,
    "sdds": len([name for name in os.listdir(sdd_dir) if name.endswith(".md")]) if os.path.isdir(sdd_dir) else 0,
    "observability": len(os.listdir(observability_dir)) if os.path.isdir(observability_dir) else 0,
}
payload = json.dumps(
    {
        "generatedAt": generated_at,
        "agents": agents,
        "skills": skills,
        "rules": rules,
        "counts": counts,
    },
    ensure_ascii=False,
)

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE - AI Orchestration</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {{ --bg:#fff8ee; --surface:#f4ebda; --surface-2:#fffdf7; --ink:#1f1534; --muted:#6d596d; --border:#38213a; --accent:#efb366; --accent-2:#9dd7e5; --accent-3:#b7dfb2; --radius:16px; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; font-family:'Fredoka',sans-serif; background:linear-gradient(180deg,#fff9f1 0%,#f7efe2 100%); color:var(--ink); }}
    header {{ padding:24px 24px 18px; border-bottom:1px solid var(--border); background:rgba(255,248,238,.92); position:sticky; top:0; backdrop-filter:blur(8px); }}
    nav a {{ margin-right:10px; color:var(--ink); text-decoration:none; border:1px solid var(--border); border-radius:999px; padding:6px 12px; background:#fffaf3; }}
    main {{ max-width:1120px; margin:0 auto; padding:32px 20px 60px; }}
    .hero,.panel {{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px; }}
    .hero {{ display:grid; gap:14px; margin-bottom:18px; }}
    .badge {{ display:inline-block; padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:var(--accent); font-size:12px; font-weight:600; }}
    .meta {{ color:var(--muted); font-size:14px; }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:14px; }}
    .card {{ background:var(--surface-2); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    h1,h2,h3,p,ul {{ margin:0; }}
    h1 {{ font-size:32px; }}
    h2 {{ font-size:18px; margin-bottom:12px; }}
    h3 {{ font-size:16px; margin-bottom:8px; }}
    p {{ color:var(--muted); line-height:1.55; }}
    section {{ margin-top:20px; }}
    .chips span {{ display:inline-block; margin:6px 6px 0 0; padding:4px 8px; border-radius:999px; border:1px solid var(--border); font-size:12px; background:var(--accent-2); }}
    table {{ width:100%; border-collapse:collapse; }}
    th,td {{ text-align:left; padding:10px 8px; border-bottom:1px solid rgba(56,33,58,.18); vertical-align:top; }}
    th {{ font-size:12px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); }}
    .two {{ display:grid; grid-template-columns:1.2fr .8fr; gap:14px; }}
    .tiny {{ font-size:13px; }}
    ul {{ padding-left:18px; margin-top:8px; color:var(--muted); line-height:1.45; }}
    @media (max-width: 860px) {{ .two {{ grid-template-columns:1fr; }} h1 {{ font-size:28px; }} }}
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="./index.html">Home</a>
      <a href="./ai-system.html">AI System</a>
      <a href="./analytics.html">Analytics</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <span class="badge">v3.0.0 Skills-First</span>
      <h1>FUSE AI Orchestration</h1>
      <p>The active orchestration model is centered on <code>.claude/</code>. This page shows the operational surface: how requests flow across agents, which knowledge packs are preloaded, and which rule surfaces are activated by file context.</p>
      <p class="meta">Generated at {generated_at}</p>
    </section>
    <section class="two">
      <div class="panel">
        <h2>Execution Flow</h2>
        <table>
          <tr><th>Step</th><th>Role</th><th>Outcome</th></tr>
          <tr><td>1</td><td>Architect</td><td>Defines SDD, boundaries, migration strategy, and cross-cutting constraints.</td></tr>
          <tr><td>2</td><td>Engineer</td><td>Implements within the layer contract and repository standards.</td></tr>
          <tr><td>3</td><td>Test Writer</td><td>Adds isolated verification around public behaviour.</td></tr>
          <tr><td>4</td><td>Reviewer / Quality</td><td>Checks regressions, maintainability, performance, and gates.</td></tr>
          <tr><td>5</td><td>PR Lifecycle</td><td>Handles deterministic PR flow without autonomous merge.</td></tr>
        </table>
      </div>
      <div class="panel">
        <h2>Core Invariants</h2>
        <div class="chips">
          <span>No barrel imports</span>
          <span>No inline styles</span>
          <span>DTOs never reach UI</span>
          <span>Coverage &gt;= 80%</span>
          <span>No real API calls in unit tests</span>
          <span>No auto-push</span>
        </div>
      </div>
    </section>
    <section class="panel">
      <h2>Operational Surfaces</h2>
      <div class="chips" id="counts"></div>
    </section>
    <section class="panel">
      <h2>Agents in Operation</h2>
      <div class="grid" id="agents"></div>
    </section>
    <section class="panel">
      <h2>Skills in Rotation</h2>
      <div class="grid" id="skills"></div>
    </section>
    <section class="panel">
      <h2>Rule Activation Surface</h2>
      <div class="grid" id="rules"></div>
    </section>
  </main>
  <script id="payload" type="application/json">{payload}</script>
  <script>
    const data = JSON.parse(document.getElementById('payload').textContent);
    const agentsRoot = document.getElementById('agents');
    const skillsRoot = document.getElementById('skills');
    const rulesRoot = document.getElementById('rules');
    const countsRoot = document.getElementById('counts');

    [['Commands', data.counts.commands], ['SDDs', data.counts.sdds], ['Observability assets', data.counts.observability]].forEach(([label, value]) => {{
      const chip = document.createElement('span');
      chip.textContent = `${{label}}: ${{value}}`;
      countsRoot.appendChild(chip);
    }});

    data.agents.forEach((agent) => {{
      const el = document.createElement('article');
      el.className = 'card';
      const skills = agent.skills.length ? agent.skills.map((skill) => `<li>${{skill}}</li>`).join('') : '<li>none</li>';
      el.innerHTML = `<h3>${{agent.name}}</h3><p>${{agent.description}}</p><ul class="tiny"><li>Model: ${{agent.model}}</li><li>Tools: ${{agent.tools.join(', ')}}</li>${{skills}}</ul>`;
      agentsRoot.appendChild(el);
    }});

    data.skills.forEach((skill) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{skill.name}}</h3><p>${{skill.description}}</p><ul class="tiny"><li>Context: ${{skill.context}}</li><li>Tools: ${{skill.tools.join(', ')}}</li></ul>`;
      skillsRoot.appendChild(el);
    }});

    data.rules.forEach((rule) => {{
      const el = document.createElement('article');
      el.className = 'card';
      const paths = rule.paths.map((path) => `<li>${{path}}</li>`).join('');
      el.innerHTML = `<h3>${{rule.name}}</h3><p>${{rule.summary}}</p><ul class="tiny">${{paths}}</ul>`;
      rulesRoot.appendChild(el);
    }});
  </script>
</body>
</html>"""

with open(out_path, "w", encoding="utf-8") as fh:
    fh.write(html)
PYEOF
