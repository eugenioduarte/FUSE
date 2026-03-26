Stores architecture decisions, accepted tradeoffs, and recurring coupling patterns.

---

## Architecture Contract — Model → Service → Query → Hook → Screen

**Rule:** Strictly respect the responsibility chain. No shortcuts between layers.

**Why:** Defined in `CLAUDE.md` and confirmed across multiple sessions. Breaking the chain creates coupling and makes testing harder. Screens that call services directly, or hooks that contain JSX, are symptoms of layer collapse.

**Applies to:** Any new feature or refactor. This is the primary architectural invariant — violations are rejected.

---

## AI System — `.claude/` Is the Active System

**Rule:** Treat `.claude/CLAUDE.md` and the `.claude/` tree as the active AI system. Use `docs/history/legacy-ai/` only as archive and migration reference.

**Why:** On 2026-03-25 the repository migrated from `.ai/` to a Skills-First `.claude/` architecture with path-scoped rules, directory-based skills, lean agents, and an enterprise SDD layer. The old system is archived.

**Applies to:** AI system maintenance, agent evolution, documentation updates, and future architecture work.

---

## Enterprise SDD Layer — Active and In Use

**Rule:** `.claude/sdd/system/` is the active enterprise design layer for domain-driven, Jira-ingested, modular SDD generation.

**Why:** Confirmed active by project owner on 2026-03-26. Status changed from "proposed extension" to active.

**Applies to:** New feature work with Jira tickets should follow the `jira-to-sdd` workflow. Domain contexts live in `sdd/system/contexts/`.
