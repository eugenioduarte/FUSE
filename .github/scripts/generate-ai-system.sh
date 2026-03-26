#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$REPO_ROOT/docs/ai-system.html"
SDD_OUT="$REPO_ROOT/docs/sdd-system.html"

python3 - "$REPO_ROOT" "$OUT" "$SDD_OUT" <<'PYEOF'
import json
import os
import re
import sys
from datetime import datetime

repo_root = sys.argv[1]
out_path = sys.argv[2]
sdd_out_path = sys.argv[3]


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
                value = line.split("- ", 1)[1].strip().strip('"')
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
    return meta, body.strip()


def first_sentence(text):
    clean = compact(text)
    if not clean:
        return ""
    return clean.split(". ", 1)[0]


def bullets_from_body(text, limit=5):
    bullets = []
    for line in text.splitlines():
        stripped = line.strip()
        if stripped.startswith("- "):
            bullets.append(stripped[2:].strip())
        if len(bullets) >= limit:
            break
    return bullets


claude_root = os.path.join(repo_root, ".claude")
agents_dir = os.path.join(claude_root, "agents")
skills_dir = os.path.join(claude_root, "skills")
rules_dir = os.path.join(claude_root, "rules")
memory_dir = os.path.join(claude_root, "agent-memory")
commands_dir = os.path.join(claude_root, "commands")
sdd_dir = os.path.join(claude_root, "sdd")
templates_dir = os.path.join(claude_root, "templates")
observability_dir = os.path.join(claude_root, "observability")
inbox_dir = os.path.join(claude_root, "inbox")
settings_path = os.path.join(claude_root, "settings.json")
claude_md_path = os.path.join(claude_root, "CLAUDE.md")
sdd_system_root = os.path.join(sdd_dir, "system")
sdd_contexts_dir = os.path.join(sdd_system_root, "contexts")
sdd_contracts_dir = os.path.join(sdd_system_root, "contracts")
sdd_integrations_dir = os.path.join(sdd_system_root, "integrations")
sdd_workflows_dir = os.path.join(sdd_system_root, "workflows")
sdd_registry_dir = os.path.join(sdd_system_root, "registry")
sdd_agents_dir = os.path.join(sdd_system_root, "agents")
sdd_templates_context_dir = os.path.join(sdd_system_root, "templates", "context")
sdd_templates_work_item_dir = os.path.join(sdd_system_root, "templates", "work-item")

claude_text = read(claude_md_path)
claude_meta, claude_body = parse_frontmatter(claude_md_path)
claude_bullets = bullets_from_body(claude_body, 8)

agents = []
for name in sorted(os.listdir(agents_dir)):
    if not name.endswith(".md"):
        continue
    meta, body = parse_frontmatter(os.path.join(agents_dir, name))
    agents.append(
        {
            "name": meta.get("name", name[:-3]),
            "model": meta.get("model", "unspecified"),
            "tools": [item.strip() for item in meta.get("tools", "Read").split(",") if item.strip()],
            "skills": meta.get("skills", []),
            "description": meta.get("description", first_sentence(body)),
            "body": compact(body),
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
            "has_assets": os.path.isdir(os.path.join(skills_dir, name, "assets")) and bool(os.listdir(os.path.join(skills_dir, name, "assets"))),
            "has_refs": os.path.isdir(os.path.join(skills_dir, name, "references")) and bool(os.listdir(os.path.join(skills_dir, name, "references"))),
            "has_scripts": os.path.isdir(os.path.join(skills_dir, name, "scripts")) and bool(os.listdir(os.path.join(skills_dir, name, "scripts"))),
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

memory = []
for name in sorted(os.listdir(memory_dir)):
    readme = os.path.join(memory_dir, name, "README.md")
    summary = read(readme).strip() if os.path.exists(readme) else ""
    memory.append({"name": name, "summary": summary})

commands = []
if os.path.isdir(commands_dir):
    for name in sorted(os.listdir(commands_dir)):
        if not name.endswith(".md"):
            continue
        text = read(os.path.join(commands_dir, name))
        invocation = ""
        for line in text.splitlines():
            if line.startswith("**Invocation:**"):
                invocation = line.replace("**Invocation:**", "").strip().strip("`")
                break
        commands.append(
            {
                "name": name[:-3],
                "title": text.splitlines()[0].lstrip("# ").strip(),
                "invocation": invocation,
                "summary": first_sentence("\n".join(text.splitlines()[1:])),
            }
        )

settings = {}
if os.path.exists(settings_path):
    settings = json.loads(read(settings_path))

stop_hooks = []
for group in settings.get("hooks", {}).get("Stop", []):
    for hook_group in group.get("hooks", []):
        stop_hooks.append(hook_group.get("command", ""))

generated_at = datetime.now().strftime("%Y-%m-%d %H:%M")
sdd_files = [name for name in os.listdir(sdd_dir) if name.endswith(".md")] if os.path.isdir(sdd_dir) else []
template_files = [name for name in os.listdir(templates_dir) if name.endswith(".md")] if os.path.isdir(templates_dir) else []
observability_files = sorted(os.listdir(observability_dir)) if os.path.isdir(observability_dir) else []

sdd_contexts = []
if os.path.isdir(sdd_contexts_dir):
    for name in sorted(os.listdir(sdd_contexts_dir)):
        path = os.path.join(sdd_contexts_dir, name)
        if not os.path.isdir(path):
            continue
        files = sorted([item for item in os.listdir(path) if item.endswith(".md")])
        sdd_contexts.append({"name": name, "files": files})

sdd_contracts = []
if os.path.isdir(sdd_contracts_dir):
    for name in sorted(os.listdir(sdd_contracts_dir)):
        if not name.endswith(".md"):
            continue
        text = read(os.path.join(sdd_contracts_dir, name))
        sdd_contracts.append({"name": name[:-3], "summary": first_sentence(text)})

sdd_integrations = []
if os.path.isdir(sdd_integrations_dir):
    for name in sorted(os.listdir(sdd_integrations_dir)):
        if not name.endswith(".md"):
            continue
        text = read(os.path.join(sdd_integrations_dir, name))
        sdd_integrations.append({"name": name[:-3], "summary": first_sentence(text)})

sdd_workflows = []
if os.path.isdir(sdd_workflows_dir):
    for name in sorted(os.listdir(sdd_workflows_dir)):
        if not name.endswith(".md"):
            continue
        text = read(os.path.join(sdd_workflows_dir, name))
        sdd_workflows.append({"name": name[:-3], "summary": first_sentence(text)})

sdd_logical_agents = []
if os.path.isdir(sdd_agents_dir):
    for name in sorted(os.listdir(sdd_agents_dir)):
        if not name.endswith(".md"):
            continue
        text = read(os.path.join(sdd_agents_dir, name))
        sdd_logical_agents.append({"name": name[:-3], "summary": first_sentence(text)})

sdd_registry = []
candidate_domains = []
naming_rules = []
domains_path = os.path.join(sdd_registry_dir, "domains.md")
if os.path.exists(domains_path):
    current_section = None
    current = None
    for line in read(domains_path).splitlines():
        stripped = line.strip()
        if stripped.startswith("## "):
            current_section = stripped[3:].strip().lower()
            current = None
            continue
        if stripped.startswith("### "):
            current = {"name": stripped[4:].strip(), "items": []}
            if current_section == "active domains":
                sdd_registry.append(current)
            continue
        if stripped.startswith("- "):
            item = stripped[2:].strip()
            if current_section == "active domains" and current:
                current["items"].append(item)
            elif current_section == "candidate domains":
                candidate_domains.append(item)
            elif current_section == "naming rules":
                naming_rules.append(item)

sdd_system_payload = json.dumps(
    {
        "generatedAt": generated_at,
        "counts": {
            "contexts": len(sdd_contexts),
            "contracts": len(sdd_contracts),
            "integrations": len(sdd_integrations),
            "workflows": len(sdd_workflows),
            "logicalAgents": len(sdd_logical_agents),
            "contextTemplates": len([name for name in os.listdir(sdd_templates_context_dir) if name.endswith(".md")]) if os.path.isdir(sdd_templates_context_dir) else 0,
            "workItemTemplates": len([name for name in os.listdir(sdd_templates_work_item_dir) if name.endswith(".md")]) if os.path.isdir(sdd_templates_work_item_dir) else 0,
        },
        "contexts": sdd_contexts,
        "contracts": sdd_contracts,
        "integrations": sdd_integrations,
        "workflows": sdd_workflows,
        "logicalAgents": sdd_logical_agents,
        "registry": sdd_registry,
        "candidateDomains": candidate_domains,
        "namingRules": naming_rules,
        "flow": [
            "Jira issue or backlog brief enters the system",
            "Context orchestrator maps the work item to one domain",
            "Raw file and orchestrator file are created",
            "Mandatory and conditional SDD modules are scaffolded",
            "Architect, design-docs, engineer, security, and test roles enrich the design",
            "Validated implementation moves to delivery and PR evidence"
        ],
        "mandatoryModules": ["orchestrator", "ui or logic", "test"],
        "conditionalModules": ["api", "state", "infra", "security", "analytics", "performance"],
    },
    ensure_ascii=False,
)

payload = json.dumps(
    {
        "generatedAt": generated_at,
        "claude": {
            "version": claude_meta.get("version", "unknown"),
            "system": claude_meta.get("system", "FUSE AI"),
            "status": claude_meta.get("status", "active"),
            "bullets": claude_bullets,
        },
        "counts": {
            "agents": len(agents),
            "skills": len(skills),
            "rules": len(rules),
        "commands": len(commands),
        "memory": len(memory),
        "sdds": len(sdd_files),
        "sddSystemContexts": len(sdd_contexts),
        "sddSystemContracts": len(sdd_contracts),
        "templates": len(template_files),
        "observability": len(observability_files),
    },
        "agents": agents,
        "skills": skills,
        "rules": rules,
        "memory": memory,
        "commands": commands,
        "sdds": sdd_files,
        "templates": template_files,
        "observability": observability_files,
        "hasInbox": os.path.isdir(inbox_dir),
        "stopHooks": stop_hooks,
    },
    ensure_ascii=False,
)

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
    :root {{ --bg:#fff8ee; --surface:#f3ead9; --panel:#fffdf8; --ink:#201533; --muted:#6d596d; --border:#38213a; --accent:#efb366; --accent2:#c8e7cb; --accent3:#bfe0ee; --accent4:#f3d8a2; --radius:16px; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; font-family:'Fredoka',sans-serif; background:linear-gradient(180deg,#fff9f1 0%,#f4ecdf 100%); color:var(--ink); }}
    header {{ padding:24px; border-bottom:1px solid var(--border); background:rgba(255,248,238,.94); position:sticky; top:0; backdrop-filter:blur(6px); }}
    nav a {{ margin-right:10px; color:var(--ink); text-decoration:none; border:1px solid var(--border); border-radius:999px; padding:6px 12px; background:#fffaf3; }}
    main {{ max-width:1180px; margin:0 auto; padding:30px 20px 60px; }}
    section {{ margin-top:18px; }}
    .hero,.panel {{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px; }}
    .badge {{ display:inline-block; margin-bottom:8px; padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:var(--accent); font-size:12px; font-weight:600; }}
    .meta {{ color:var(--muted); }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }}
    .grid.tight {{ grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }}
    .card {{ background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    h1,h2,h3,p,ul {{ margin:0; }}
    h1 {{ font-size:34px; }}
    h2 {{ font-size:18px; margin-bottom:12px; }}
    h3 {{ font-size:16px; margin-bottom:8px; }}
    p {{ line-height:1.55; }}
    ul {{ padding-left:18px; margin-top:8px; color:var(--muted); line-height:1.5; }}
    table {{ width:100%; border-collapse:collapse; }}
    th,td {{ text-align:left; padding:10px 8px; border-bottom:1px solid rgba(56,33,58,.16); vertical-align:top; }}
    th {{ font-size:12px; color:var(--muted); text-transform:uppercase; }}
    .kpi {{ text-align:center; background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    .kpi strong {{ display:block; font-size:30px; line-height:1; margin-bottom:6px; }}
    .chips span {{ display:inline-block; margin:6px 6px 0 0; padding:4px 8px; border-radius:999px; border:1px solid var(--border); font-size:12px; background:var(--accent3); }}
    .path-list li, .hook-list li {{ font-family:ui-monospace, SFMono-Regular, Menlo, monospace; font-size:13px; }}
    .summary {{ color:var(--muted); }}
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="./index.html">Home</a>
      <a href="./sdd-system.html">SDD System</a>
      <a href="./demonstration-orchestration.html">Orchestration</a>
      <a href="./analytics.html">Analytics</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <span class="badge">Enterprise Skills-First architecture</span>
      <h1>FUSE AI System</h1>
      <p class="meta">The live system is fully rooted in <code>.claude/</code>. This page is generated from the active configuration and covers entrypoint, agents, skills, rules, memory, commands, SDDs, templates, observability, and runtime hooks. Generated at {generated_at}.</p>
    </section>
    <section class="grid tight" id="kpis"></section>
    <section class="panel">
      <h2>CLAUDE Entry Point</h2>
      <p class="summary">Versioned system contract loaded as the primary AI entrypoint for the repository.</p>
      <div class="chips" id="claudeMeta"></div>
      <ul id="claudeBullets"></ul>
    </section>
    <section class="panel">
      <h2>Architecture Flow</h2>
      <table>
        <tr><th>Layer</th><th>Purpose</th></tr>
        <tr><td>CLAUDE.md</td><td>Identity, routing policy, critical invariants, and governance anchor.</td></tr>
        <tr><td>Rules</td><td>Path-scoped guardrails activated by touched files.</td></tr>
        <tr><td>Skills</td><td>Reusable knowledge, templates, references, and targeted automation.</td></tr>
        <tr><td>Agents</td><td>Execution roles with bounded tools, models, and default skill packs.</td></tr>
        <tr><td>Agent memory</td><td>Persistent role-level memory boundaries.</td></tr>
        <tr><td>SDDs + inbox</td><td>Business intake and design backlog used to drive implementation work.</td></tr>
        <tr><td>Templates + observability</td><td>Reusable scaffolds plus token, orchestration, and PR cost telemetry.</td></tr>
        <tr><td>Commands + hooks</td><td>Operational entrypoints and runtime automations around the agent system.</td></tr>
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
      <h2>Agent Memory</h2>
      <div class="grid" id="memory"></div>
    </section>
    <section class="panel">
      <h2>Command Surface</h2>
      <div class="grid" id="commands"></div>
    </section>
    <section class="panel">
      <h2>Design Backlog</h2>
      <div class="grid" id="sdds"></div>
    </section>
    <section class="panel">
      <h2>Operational Assets</h2>
      <div class="grid" id="operations"></div>
    </section>
    <section class="panel">
      <h2>Runtime Hooks</h2>
      <p class="summary">Hooks currently declared in <code>.claude/settings.json</code>.</p>
      <ul class="hook-list" id="hooks"></ul>
    </section>
    <section class="panel">
      <h2>Migration Timeline</h2>
      <div class="grid tight">
        <article class="card"><h3>v1</h3><p class="summary">Experimental multi-agent generation and early orchestration patterns.</p></article>
        <article class="card"><h3>v2</h3><p class="summary">Consolidated legacy <code>.ai/</code> orchestrator with a central system prompt and early public analytics.</p></article>
        <article class="card"><h3>v3</h3><p class="summary">Skills-First <code>.claude/</code> architecture with generated public documentation and path-scoped rules.</p></article>
      </div>
    </section>
  </main>
  <script id="payload" type="application/json">{payload}</script>
  <script>
    const data = JSON.parse(document.getElementById('payload').textContent);
    const kpiItems = [
      ['Agents', data.counts.agents],
      ['Skills', data.counts.skills],
      ['Rules', data.counts.rules],
      ['Commands', data.counts.commands],
      ['Memory spaces', data.counts.memory],
      ['SDDs', data.counts.sdds],
      ['SDD contexts', data.counts.sddSystemContexts],
      ['SDD contracts', data.counts.sddSystemContracts],
      ['Templates', data.counts.templates],
      ['Observability assets', data.counts.observability]
    ];
    const kpis = document.getElementById('kpis');
    kpiItems.forEach(([label, value]) => {{
      const el = document.createElement('article');
      el.className = 'kpi';
      el.innerHTML = `<strong>${{value}}</strong><span class="meta">${{label}}</span>`;
      kpis.appendChild(el);
    }});

    const claudeMeta = document.getElementById('claudeMeta');
    ['Version: ' + data.claude.version, 'System: ' + data.claude.system, 'Status: ' + data.claude.status].forEach((item) => {{
      const chip = document.createElement('span');
      chip.textContent = item;
      claudeMeta.appendChild(chip);
    }});
    const claudeBullets = document.getElementById('claudeBullets');
    data.claude.bullets.forEach((bullet) => {{
      const li = document.createElement('li');
      li.textContent = bullet;
      claudeBullets.appendChild(li);
    }});

    const agentsBody = document.querySelector('#agentsTable tbody');
    data.agents.forEach((agent) => {{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${{agent.name}}</td><td>${{agent.model}}</td><td>${{agent.tools.join(', ')}}</td><td>${{agent.skills.join(', ')}}</td><td>${{agent.description}}</td>`;
      agentsBody.appendChild(tr);
    }});

    const skillsRoot = document.getElementById('skills');
    data.skills.forEach((skill) => {{
      const traits = [];
      if (skill.has_assets) traits.push('assets');
      if (skill.has_refs) traits.push('references');
      if (skill.has_scripts) traits.push('scripts');
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{skill.name}}</h3><p class="summary">${{skill.description}}</p><ul><li>Context: ${{skill.context}}</li><li>Tools: ${{skill.tools.join(', ')}}</li><li>Extras: ${{traits.length ? traits.join(', ') : 'none'}}</li></ul>`;
      skillsRoot.appendChild(el);
    }});

    const rulesRoot = document.getElementById('rules');
    data.rules.forEach((rule) => {{
      const el = document.createElement('article');
      el.className = 'card';
      const paths = rule.paths.map((p) => `<li>${{p}}</li>`).join('');
      el.innerHTML = `<h3>${{rule.name}}</h3><p class="summary">${{rule.summary}}</p><ul class="path-list">${{paths}}</ul>`;
      rulesRoot.appendChild(el);
    }});

    const memoryRoot = document.getElementById('memory');
    data.memory.forEach((entry) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{entry.name}}</h3><p class="summary">${{entry.summary}}</p>`;
      memoryRoot.appendChild(el);
    }});

    const commandsRoot = document.getElementById('commands');
    data.commands.forEach((command) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{command.name}}</h3><p class="summary">${{command.title}}</p><ul><li>Invocation: ${{command.invocation || 'n/a'}}</li><li>${{command.summary}}</li></ul>`;
      commandsRoot.appendChild(el);
    }});

    const sddRoot = document.getElementById('sdds');
    data.sdds.forEach((name) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{name}}</h3><p class="summary">Active design document in <code>.claude/sdd/</code>.</p>`;
      sddRoot.appendChild(el);
    }});

    const opsRoot = document.getElementById('operations');
    const operationalCards = [
      ['Inbox', data.hasInbox ? 'Present in <code>.claude/inbox/</code> for summary intake.' : 'Not configured.'],
      ['Templates', data.templates.length ? data.templates.join(', ') : 'None'],
      ['Observability', data.observability.length ? data.observability.join(', ') : 'None']
    ];
    operationalCards.forEach(([title, body]) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{title}}</h3><p class="summary">${{body}}</p>`;
      opsRoot.appendChild(el);
    }});

    const hooksRoot = document.getElementById('hooks');
    data.stopHooks.forEach((hook) => {{
      const li = document.createElement('li');
      li.textContent = hook;
      hooksRoot.appendChild(li);
    }});
  </script>
</body>
</html>"""

with open(out_path, "w", encoding="utf-8") as fh:
    fh.write(html)

sdd_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FUSE - SDD System</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {{ --bg:#fff8ee; --surface:#f4ebda; --panel:#fffdf7; --ink:#1f1534; --muted:#6d596d; --border:#38213a; --accent:#efb366; --accent2:#bfe0ee; --accent3:#c5e3c0; --accent4:#f3d8a2; --radius:16px; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; font-family:'Fredoka',sans-serif; background:linear-gradient(180deg,#fffaf2 0%,#f7eee1 100%); color:var(--ink); }}
    header {{ padding:24px; border-bottom:1px solid var(--border); background:rgba(255,248,238,.94); position:sticky; top:0; backdrop-filter:blur(6px); }}
    nav a {{ margin-right:10px; color:var(--ink); text-decoration:none; border:1px solid var(--border); border-radius:999px; padding:6px 12px; background:#fffaf3; }}
    main {{ max-width:1180px; margin:0 auto; padding:30px 20px 60px; }}
    section {{ margin-top:18px; }}
    .hero,.panel {{ background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:22px; }}
    .badge {{ display:inline-block; margin-bottom:8px; padding:4px 10px; border:1px solid var(--border); border-radius:999px; background:var(--accent); font-size:12px; font-weight:600; }}
    .meta,.summary {{ color:var(--muted); }}
    .grid {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:14px; }}
    .grid.tight {{ grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); }}
    .card {{ background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    h1,h2,h3,p,ul,pre {{ margin:0; }}
    h1 {{ font-size:34px; }}
    h2 {{ font-size:18px; margin-bottom:12px; }}
    h3 {{ font-size:16px; margin-bottom:8px; }}
    p {{ line-height:1.55; }}
    ul {{ padding-left:18px; margin-top:8px; color:var(--muted); line-height:1.5; }}
    .kpi {{ text-align:center; background:var(--panel); border:1px solid var(--border); border-radius:14px; padding:16px; }}
    .kpi strong {{ display:block; font-size:30px; line-height:1; margin-bottom:6px; }}
    .diagram {{ overflow:auto; background:#fffaf3; border:1px dashed var(--border); border-radius:14px; padding:16px; font-family:ui-monospace, SFMono-Regular, Menlo, monospace; color:#3e2a4a; line-height:1.5; }}
    .steps li {{ margin-bottom:8px; }}
    .chips span {{ display:inline-block; margin:6px 6px 0 0; padding:4px 8px; border-radius:999px; border:1px solid var(--border); font-size:12px; background:var(--accent2); }}
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="./index.html">Home</a>
      <a href="./ai-system.html">AI System</a>
      <a href="./demonstration-orchestration.html">Orchestration</a>
      <a href="./analytics.html">Analytics</a>
    </nav>
  </header>
  <main>
    <section class="hero">
      <span class="badge">Enterprise SDD operating model</span>
      <h1>FUSE SDD System</h1>
      <p class="meta">This page documents how <code>.claude/sdd/system/</code> turns Jira-style requests into domain-scoped modular SDDs, then hands work to the active <code>.claude/</code> agents. Generated at {generated_at}.</p>
    </section>
    <section class="grid tight" id="kpis"></section>
    <section class="panel">
      <h2>Executive Model</h2>
      <p class="summary">The SDD system extends the current Skills-First runtime with persistent domain contexts, orchestration contracts, delivery separation, and integration-ready MCP governance.</p>
      <div class="chips">
        <span>Request-driven -> domain-driven</span>
        <span>Jira -> Context -> SDD -> Code -> PR</span>
        <span>Persistent domain memory</span>
        <span>Mandatory + conditional modules</span>
      </div>
    </section>
    <section class="panel">
      <h2>Process Diagram</h2>
      <pre class="diagram">[ Jira / Backlog Brief ]
            |
            v
[ Context Orchestrator ]
            |
            v
[ Domain Detection ]
  auth | dashboard | future domains
            |
            v
[ Raw + Orchestrator Files ]
            |
            v
[ Modular SDD Set ]
  logic/ui + test + optional api/state/security/analytics/performance
            |
            v
[ Execution Agents ]
  architect -> design-docs -> engineer -> security/test/reviewer/quality
            |
            v
[ Delivery ]
  branch -> commit -> PR evidence -> analytics</pre>
    </section>
    <section class="panel">
      <h2>Context Structure Diagram</h2>
      <pre class="diagram">.claude/sdd/system/
  contexts/
    auth/
      _context.md
      _architecture.md
      _decisions.md
      _shared-components.md
      epic-auth-rework/
        us-123-login/
          us-123-login-raw.md
          us-123-login-orchestrator.md
          us-123-login.logic.sdd.md
          us-123-login.test.sdd.md
          us-123-login.security.sdd.md</pre>
    </section>
    <section class="panel">
      <h2>Execution Flow</h2>
      <ol class="steps" id="flow"></ol>
    </section>
    <section class="grid">
      <section class="panel">
        <h2>Mandatory Modules</h2>
        <div class="grid tight" id="mandatory"></div>
      </section>
      <section class="panel">
        <h2>Conditional Modules</h2>
        <div class="grid tight" id="conditional"></div>
      </section>
    </section>
    <section class="panel">
      <h2>Domain Contexts</h2>
      <div class="grid" id="contexts"></div>
    </section>
    <section class="panel">
      <h2>Contracts</h2>
      <div class="grid" id="contracts"></div>
    </section>
    <section class="panel">
      <h2>Logical Roles</h2>
      <div class="grid" id="logicalAgents"></div>
    </section>
    <section class="panel">
      <h2>MCP and Integration Layer</h2>
      <div class="grid" id="integrations"></div>
    </section>
    <section class="panel">
      <h2>Workflow Registry</h2>
      <div class="grid" id="workflows"></div>
    </section>
    <section class="panel">
      <h2>Domain Registry</h2>
      <div class="grid" id="registry"></div>
    </section>
    <section class="grid">
      <section class="panel">
        <h2>Candidate Domains</h2>
        <div class="grid tight" id="candidateDomains"></div>
      </section>
      <section class="panel">
        <h2>Naming Rules</h2>
        <ul class="steps" id="namingRules"></ul>
      </section>
    </section>
  </main>
  <script id="payload" type="application/json">{sdd_system_payload}</script>
  <script>
    const data = JSON.parse(document.getElementById('payload').textContent);
    const kpiItems = [
      ['Contexts', data.counts.contexts],
      ['Contracts', data.counts.contracts],
      ['Integrations', data.counts.integrations],
      ['Workflows', data.counts.workflows],
      ['Logical roles', data.counts.logicalAgents],
      ['Context templates', data.counts.contextTemplates],
      ['Work-item templates', data.counts.workItemTemplates]
    ];
    const kpis = document.getElementById('kpis');
    kpiItems.forEach(([label, value]) => {{
      const el = document.createElement('article');
      el.className = 'kpi';
      el.innerHTML = `<strong>${{value}}</strong><span class="meta">${{label}}</span>`;
      kpis.appendChild(el);
    }});

    const flow = document.getElementById('flow');
    data.flow.forEach((step) => {{
      const li = document.createElement('li');
      li.textContent = step;
      flow.appendChild(li);
    }});

    const mandatory = document.getElementById('mandatory');
    data.mandatoryModules.forEach((name) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{name}}</h3><p class="summary">Required in the baseline work-item contract.</p>`;
      mandatory.appendChild(el);
    }});

    const conditional = document.getElementById('conditional');
    data.conditionalModules.forEach((name) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{name}}</h3><p class="summary">Created only when the work item touches this concern.</p>`;
      conditional.appendChild(el);
    }});

    const contexts = document.getElementById('contexts');
    data.contexts.forEach((item) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{item.name}}</h3><p class="summary">Baseline domain memory files: ${{item.files.join(', ')}}</p>`;
      contexts.appendChild(el);
    }});

    const contracts = document.getElementById('contracts');
    data.contracts.forEach((item) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{item.name}}</h3><p class="summary">${{item.summary}}</p>`;
      contracts.appendChild(el);
    }});

    const logicalAgents = document.getElementById('logicalAgents');
    data.logicalAgents.forEach((item) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{item.name}}</h3><p class="summary">${{item.summary}}</p>`;
      logicalAgents.appendChild(el);
    }});

    const integrations = document.getElementById('integrations');
    data.integrations.forEach((item) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{item.name}}</h3><p class="summary">${{item.summary}}</p>`;
      integrations.appendChild(el);
    }});

    const workflows = document.getElementById('workflows');
    data.workflows.forEach((item) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{item.name}}</h3><p class="summary">${{item.summary}}</p>`;
      workflows.appendChild(el);
    }});

    const registry = document.getElementById('registry');
    data.registry.forEach((domain) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{domain.name}}</h3><p class="summary">${{domain.items.join(', ')}}</p>`;
      registry.appendChild(el);
    }});

    const candidateDomains = document.getElementById('candidateDomains');
    data.candidateDomains.forEach((name) => {{
      const el = document.createElement('article');
      el.className = 'card';
      el.innerHTML = `<h3>${{name}}</h3><p class="summary">Candidate context for future domain expansion.</p>`;
      candidateDomains.appendChild(el);
    }});

    const namingRules = document.getElementById('namingRules');
    data.namingRules.forEach((rule) => {{
      const li = document.createElement('li');
      li.textContent = rule;
      namingRules.appendChild(li);
    }});
  </script>
</body>
</html>"""

with open(sdd_out_path, "w", encoding="utf-8") as fh:
    fh.write(sdd_html)
PYEOF
