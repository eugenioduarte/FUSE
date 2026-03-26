# Token Economics — Claude-Only Era

> Data source: real sessions only. Collection started 2026-03-22 when the Stop hook was wired.
> Previous mock data removed 2026-03-26. This file reflects only verified production sessions.

## Current State

**Sessions tracked:** 2
**Period:** 2026-03-22 → 2026-03-26
**Provider:** Claude Sonnet 4.6 (claude-only architecture since 2026-03-25)

| Metric | Value |
|---|---|
| Total input tokens | 68,390 |
| Total output tokens | 1,987,949 |
| Total cache reads | 369,762,715 |
| Total tokens (input + output) | 2,056,339 |
| Cache multiplier | ~5,395x vs generation |

## Cost Breakdown (Real Sessions)

Claude Sonnet 4.6 pricing: $3.00/1M input · $15.00/1M output · $0.30/1M cache read

| Component | Tokens | Cost (USD) |
|---|---:|---:|
| Input | 68,390 | $0.21 |
| Output | 1,987,949 | $29.82 |
| Cache reads | 369,762,715 | $110.93 |
| **Total** | | **$140.96** |

> Note: cache reads dominate cost due to heavy reuse of skill and rule prompts across turns within sessions. This validates the skills-as-modules architecture — structured prompts create high cache efficiency.

## Session Breakdown

### Session `3512aca5` (2026-03-22 → 2026-03-23)

19 turns. Initial system setup: SDD work, orchestration configuration, Stop hook validation, GitHub Pages generation.

- Input: 57,874 tokens
- Output: 1,935,307 tokens
- Cache reads: ~364,033,000 tokens

### Session `8c02e4f0` (2026-03-26)

3 turns. Post-migration fidelity restoration: skills, rules, agent-memory, observability cleanup.

- Input: 10,516 tokens
- Output: 52,642 tokens
- Cache reads: 5,729,948 tokens

## Architecture Decision: Claude-Only

The previous system routed tasks between Ollama local (qwen2.5-coder:14b) and Claude remote.
Decision taken 2026-03-25: **Claude-only**.

Rationale: maintaining two LLM backends added operational complexity (two log scripts, model conflict resolution, dual pricing models) without meaningful cost savings at current scale. Full documentation in `.claude/observability/router.md`.

## What to Watch As Data Accumulates

- **Cost per session type:** architecture vs implementation vs review sessions
- **Agent token distribution:** which agents consume most context
- **Cache efficiency per skill:** heavy skills (security, SDD) vs lightweight rules
- **PR cost rollups:** once pr-costs.csv has real data, cost per delivery becomes visible

## Pricing Reference

| Token type | Rate |
|---|---|
| Input | $3.00 / 1M |
| Output | $15.00 / 1M |
| Cache read | $0.30 / 1M |

Last updated: 2026-03-26
