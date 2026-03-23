> **[EN]** SDD for the full analytics graph suite on the GitHub Pages dashboard — 12 visualization components covering agent orchestration, cost analysis, failure patterns, efficiency KPIs, and usage heatmap. All charts are static HTML generated at CI time, no server required.

---

# SDD: GitHub Pages — Full Graph Suite

> Status: Pending

## 1. Overview

Extend the existing `demonstration-orchestration.html` GitHub Pages dashboard with a comprehensive analytics layer: **12 chart components** grouped into 5 sections (Agent Orchestration, Cost Analysis, Failure Analysis, Efficiency, Usage Patterns). All data is derived from local CSV/log files and the GitHub API at CI generation time. No server, no runtime dependencies — self-contained HTML with Chart.js 4 and D3.js loaded from CDN.

This SDD builds directly on top of `00-web-demonstration.sdd.done.md`. The existing `generate-dashboard.sh` is the entry point and will be extended.

---

## 2. User Stories

- As a **recruiter**, I want to see a live agent network graph showing how AI agents interact, so I can understand the system's architectural sophistication at a glance.
- As a **developer**, I want a cost-over-time line chart, so I can detect usage spikes before they become expensive.
- As a **developer**, I want to see cost per agent, so I can identify candidates for local model migration.
- As a **developer**, I want a usage heatmap, so I can understand my own productivity patterns over time.
- As a **team member**, I want ROI estimates (AI cost vs manual hours avoided), so I can justify the AI engineering investment.
- As a **developer**, I want to see retries vs cost, so I can quantify the cost of CI instability.

---

## 3. Dashboard Structure

The extended dashboard adds a second HTML page (`docs/analytics.html`) generated alongside the existing `demonstration-orchestration.html`. The landing page retains its current structure; analytics lives at `/analytics.html` with a cross-link.

### Section 1 — Agent Orchestration

| Chart | Type | ID |
|-------|------|----|
| Agent Network Graph | Force-directed (D3.js) | `#chart-network` |

### Section 2 — Cost Analysis

| Chart | Type | ID |
|-------|------|----|
| Cost Over Time | Line Chart (Chart.js) | `#chart-cost-time` |
| Cost per Agent | Horizontal Bar (Chart.js) | `#chart-cost-agent` |
| Model Distribution | Donut (Chart.js) | `#chart-model-dist` |

### Section 3 — Failure Analysis

| Chart | Type | ID |
|-------|------|----|
| Retries vs Cost | Grouped Bar (Chart.js) | `#chart-retries` |
| Cost per Error Type | Bar (Chart.js) | `#chart-error-cost` |

### Section 4 — Efficiency

| Chart | Type | ID |
|-------|------|----|
| Cost per PR | Bar / Scatter (Chart.js) | `#chart-cost-pr` |
| Efficiency KPIs | Stat cards (HTML) | `#kpi-block` |
| ROI — Cost Avoided | Line Chart (Chart.js) | `#chart-roi` |

### Section 5 — Usage Patterns

| Chart | Type | ID |
|-------|------|----|
| Usage Heatmap | Calendar heatmap (D3.js) | `#chart-heatmap` |
| Tokens per Task Type | Stacked Bar (Chart.js) | `#chart-task-tokens` |
| Cost per Architecture Layer | Bar (Chart.js) | `#chart-layer-cost` |

---

## 4. Domain Model

```typescript
// Existing — no change
interface DailyTokenUsage {
  date: string;              // "YYYY-MM-DD"
  claudeInput: number;
  claudeOutput: number;
  claudeCache: number;
  claudeTotal: number;
  ollamaInput: number;
  ollamaOutput: number;
  ollamaTotal: number;
}

// New — agent-level execution tracking
interface AgentExecution {
  timestamp: string;         // ISO datetime
  sessionId: string;
  agentName: string;         // matches .ai/agents/*.md filename stem
  taskType: TaskType;        // derived from agent role or tag
  provider: 'claude' | 'ollama';
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;  // calculated at write time
}

type TaskType =
  | 'architecture'
  | 'implementation'
  | 'tests'
  | 'pr-lifecycle'
  | 'sonar'
  | 'security'
  | 'review'
  | 'other';

// New — PR lifecycle cost
interface PRCost {
  prId: number;
  prTitle: string;
  status: 'success' | 'failed' | 'merged';
  totalTokens: number;
  estimatedCostUsd: number;
  retries: number;           // CI re-runs count
  errorTypes: string[];      // ['ESLint', 'TypeScript', ...]
  mergedAt: string | null;
}

// New — error cost
interface ErrorCost {
  errorType: string;         // 'ESLint' | 'TypeScript' | 'Tests' | 'Sonar' | 'Other'
  occurrences: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

// New — architecture layer cost
interface LayerCost {
  layer: 'Screen' | 'Hook' | 'Repository' | 'DAO' | 'Service' | 'Other';
  totalTokens: number;
  estimatedCostUsd: number;
}

// New — ROI
interface ROIPoint {
  date: string;              // "YYYY-MM-DD"
  estimatedHumanHoursAvoided: number;
  estimatedCostSaved: number; // humanHours * hourlyRate
  llmCostUsd: number;
  netSavingUsd: number;
}

// Aggregate for network graph
interface AgentNode {
  id: string;                // agent filename stem
  label: string;
  type: 'architecture' | 'implementation' | 'qa' | 'automation' | 'security';
  totalTokens: number;
  estimatedCostUsd: number;
}

interface AgentEdge {
  source: string;
  target: string;
  edgeType: 'flow' | 'retry' | 'dependency';
  frequency: number;
  successRate: number;
}
```

---

## 5. API Contract

No external API at runtime. Data is resolved at **CI generation time** via:

### Data Sources

| Source | Format | Produced by | Charts |
|--------|--------|-------------|--------|
| `.ai/router/token-usage.csv` | CSV | Stop hook | Cost Over Time, Model Distribution, Heatmap |
| `.ai/router/orchestration.csv` | CSV (new) | Stop hook extension | Agent Network, Cost per Agent, Task Tokens, Layer Cost |
| `.ai/router/pr-costs.csv` | CSV (new) | `collect-pr-costs.sh` | Cost per PR, Retries vs Cost, Error Cost |
| GitHub Actions API | JSON (fetched at CI time) | `gh` CLI in workflow | PR data, CI failure types |

### Cost Calculation

Claude Sonnet pricing (at time of writing):
- Input: $3.00 / 1M tokens
- Output: $15.00 / 1M tokens
- Cache read: $0.30 / 1M tokens

Ollama: $0.00 (local)

```python
def estimate_cost(provider, input_tokens, output_tokens, cache_tokens):
    if provider != 'claude':
        return 0.0
    return (
        input_tokens  * 3.00  / 1_000_000 +
        output_tokens * 15.00 / 1_000_000 +
        cache_tokens  * 0.30  / 1_000_000
    )
```

### ROI Assumptions (configurable in `generate-analytics.sh`)

- Average senior engineer hourly rate: `$60/h` (default, overridable via env var)
- Average manual PR effort: `2 hours`
- Estimation: 1 AI session = 0.5–2 human hours avoided (task-type dependent)

---

## 6. DTO → Model Mapping

### `token-usage.csv` → `DailyTokenUsage`

```
col[0] date[:10]   → date
col[2] provider    → group: claude | ollama
col[4] input       → claudeInput / ollamaInput
col[5] output      → claudeOutput / ollamaOutput
col[6] cache_read  → claudeCache
col[7] total       → claudeTotal / ollamaTotal
```

### `orchestration.csv` (new schema)

```
timestamp,session_id,agent_name,task_type,provider,model,input_tokens,output_tokens,cache_tokens,total_tokens,cost_usd
```

Stop hook extension must write one row per session, enriching the existing `log-claude-tokens.sh` with `agent_name` (derived from transcript or context) and `task_type` (heuristic from agent name → task_type map).

### `pr-costs.csv` (new schema)

```
pr_id,pr_title,status,total_tokens,cost_usd,retries,error_types,merged_at
```

Collected by a new script `collect-pr-costs.sh` that runs in the merge workflow using `gh pr list` + Actions API.

---

## 7. Data Layer

No SQLite. All data is CSV-based, file-resident in `.ai/router/`.

### New Files

| Path | Written by | When |
|------|-----------|------|
| `.ai/router/orchestration.csv` | `log-claude-tokens.sh` (extended) | On each Claude session end |
| `.ai/router/pr-costs.csv` | `collect-pr-costs.sh` | On merge workflow run |
| `docs/analytics.html` | `generate-analytics.sh` | PR workflow + merge workflow |

### Offline Strategy

Not applicable. Static files committed to the repo and served by GitHub Pages.

### Script Locations

```
.ai/router/log-claude-tokens.sh      ← extended to write orchestration.csv
.ai/scripts/generate-analytics.sh   ← new: reads all CSVs → analytics.html
.ai/scripts/collect-pr-costs.sh     ← new: gh CLI → pr-costs.csv
.github/workflows/dashboard-merge.yml ← extended to run collect-pr-costs.sh + generate-analytics.sh
.github/workflows/dashboard-pr.yml   ← extended to generate-analytics.sh (artifact only)
```

---

## 8. State Strategy

No reactive state. All charts are rendered at page load from embedded JSON (same pattern as `demonstration-orchestration.html`).

```html
<script id="analytics-data" type="application/json">
{
  "dailyCosts": [...],
  "agentCosts": [...],
  "agentNetwork": { "nodes": [...], "edges": [...] },
  "prCosts": [...],
  "errorCosts": [...],
  "heatmap": [...],
  "roi": [...],
  "kpis": { "tokensPerPR": 0, "tokensPerFeature": 0, "costPerPR": 0 }
}
</script>
```

### Chart Interactivity

- Click agent node (network graph) → popover with token total, cost, last 5 executions
- Click heatmap cell → filter all charts to that day's sessions
- Hover on all charts → Chart.js built-in tooltip
- No URL state, no localStorage

---

## 9. Script Design

### `generate-analytics.sh`

```
Input:
  - REPO_ROOT
  - .ai/router/token-usage.csv
  - .ai/router/orchestration.csv
  - .ai/router/pr-costs.csv
  - Optional: HOURLY_RATE (default 60)

Steps:
  1. Parse token-usage.csv → daily cost series + heatmap data
  2. Parse orchestration.csv → agentCosts[], taskTokens[], layerCosts[], agentNetwork{}
  3. Parse pr-costs.csv → prCosts[], errorCosts[], retriesCosts[]
  4. Compute ROI[] and KPIs{}
  5. Embed all as JSON in analytics.html
  6. Render HTML with Chart.js + D3.js CDN + same design system (Fredoka, warm cream)

Output:
  docs/analytics.html (self-contained)
```

### `collect-pr-costs.sh`

```
Requires: gh CLI authenticated (GITHUB_TOKEN in CI)

Steps:
  1. gh pr list --state merged --limit 50 --json number,title,mergedAt
  2. For each PR: gh run list --json conclusion,name + count retries
  3. Parse failed check names → error types (ESLint / TypeScript / Tests / Sonar)
  4. Join with token-usage.csv sessions that overlap PR merge window (±1h heuristic)
  5. Append new rows to pr-costs.csv (skip existing PR IDs)
```

### `log-claude-tokens.sh` extension

New fields added to orchestration.csv row:
- `agent_name`: read from env var `CLAUDE_AGENT_NAME` if set, else `'unknown'`
- `task_type`: mapped from agent_name via static dict

```python
AGENT_TASK_MAP = {
    'react-native-engineer':    'implementation',
    'frontend-architect':       'architecture',
    'sonar-fixer':              'sonar',
    'pr-lifecycle':             'pr-lifecycle',
    'security-auditor':         'security',
    'test-engineer':            'tests',
    # default
    '_default':                 'other',
}
```

---

## 10. Error Handling

| Scenario | Handling |
|----------|----------|
| `orchestration.csv` missing | Render affected charts with "No data yet" empty state |
| `pr-costs.csv` missing | Skip PR/failure/retry sections; show message in those chart wrappers |
| GitHub API rate limit in CI | `collect-pr-costs.sh` catches 403, writes partial data, exits 0 |
| Agent name unknown | Default to `'other'` task type; node still renders with `?` label |
| Cost calculation overflow (very large token counts) | Cap display at `999K`; raw value preserved in tooltip |
| D3.js CDN unavailable | Network graph canvas shows "Graph unavailable (CDN)" |
| `gh` CLI not authenticated | `collect-pr-costs.sh` skips gracefully; PR charts show empty state |

---

## 11. Edge Cases

| Edge Case | Resolution |
|-----------|-----------|
| PR merged before `orchestration.csv` started | PR row exists but `total_tokens = 0`; shown in chart as $0 bar |
| Multiple sessions within one PR | Sum all sessions in the ±1h merge window |
| Heatmap with < 7 days of data | Render only available days; no empty padding |
| Agent with 0 tokens (never ran) | Excluded from cost-per-agent chart; still shown as node in network graph |
| ROI with no manual hour baseline | KPI shows "–" with tooltip: "Set HOURLY_RATE env var to enable ROI" |
| `error_types` column has multiple values | Stored as pipe-separated `ESLint|TypeScript`; parsed to array at read time |
| D3 network graph with no edges | Renders isolated nodes only; no crash |

---

## 12. Out of Scope

- **Real-time streaming charts** — static generation only; no WebSockets
- **Per-commit cost breakdown** — requires git hook per commit, not per session; deferred
- **Multi-repo aggregation** — single repo only
- **Cost alerts / notifications** — Slack/email integration deferred to a separate SDD
- **User authentication on the dashboard** — public GitHub Pages, no login
- **Mobile-optimized layout for network graph** — force-directed graph is desktop-only; responsive flag deferred to `ui-polish` agent
- **Automated hourly rate calibration** — static default only; no ML-based estimation
- **Historical PR cost backfill beyond 50 PRs** — GitHub API pagination is out of scope for MVP

---

## 13. Implementation Order

1. **Extend `log-claude-tokens.sh`** — write to `orchestration.csv` in addition to `token-usage.csv`
2. **Write `collect-pr-costs.sh`** — GitHub API → `pr-costs.csv`; test locally with `gh` CLI
3. **Implement cost estimation** — add `estimate_cost()` Python function shared between both scripts
4. **Write `generate-analytics.sh`** — scaffold with all 12 chart slots; implement one section at a time:
   - a. Cost Over Time (easiest — reuses token-usage.csv logic)
   - b. Model Distribution (already partially exists in main dashboard)
   - c. Usage Heatmap (D3.js — most complex; implement last in this group)
   - d. Cost per Agent (requires orchestration.csv)
   - e. Tokens per Task Type (requires orchestration.csv)
   - f. Agent Network Graph (D3 force — most complex; implement after data layer is stable)
   - g. Cost per PR + Retries + Error Cost (requires pr-costs.csv)
   - h. Efficiency KPIs (derived from all above)
   - i. ROI (derived from KPIs + HOURLY_RATE)
   - j. Cost per Architecture Layer (requires layer field in orchestration.csv)
5. **Cross-link** — add `Analytics →` link in `demonstration-orchestration.html` header
6. **Extend workflows** — `dashboard-merge.yml` runs `collect-pr-costs.sh` before `generate-analytics.sh`
7. **Validate end-to-end** — merge a PR, confirm `docs/analytics.html` is published and all charts render

---

## 14. Quality Gates

- `generate-analytics.sh` exits 0 when all three CSV files are missing (graceful empty state)
- All Chart.js charts render without console errors on empty datasets
- D3 network graph renders with ≥ 1 node and 0 edges without crashing
- `collect-pr-costs.sh` is idempotent — running it twice does not duplicate rows in `pr-costs.csv`
- Cost estimation is unit-tested: `estimate_cost('claude', 1000, 500, 200)` returns the expected value
- `analytics.html` loads in < 3s on a 3G connection (CDN-only, no large bundles)
- Generated HTML passes W3C validation
- GitHub Actions workflow completes in < 90 seconds (includes `gh` API calls)
