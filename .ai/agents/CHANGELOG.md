# 📋 Agents Changelog

> **[PT]** Este documento regista todas as alterações de versão dos agents do sistema FUSE AI, seguindo as convenções de Semantic Versioning para garantir rastreabilidade e audit trail completo.

---

## 🎯 Purpose

This changelog tracks version history for all AI agents in the FUSE orchestration system. Each agent follows semantic versioning (MAJOR.MINOR.PATCH) to ensure compatibility tracking and enable rollback capabilities.

---

## 📊 Current Versions (v2.0.0 — Consolidated)

| Agent | Version | Date | Description |
|---|---|---|---|
| **architect** | 2.0.0 | 2026-03-24 | Consolidation of `frontend-architect` + `coupling-analyzer` |
| **engineer** | 2.0.0 | 2026-03-24 | Consolidation of `react-native-engineer` + `logic-engineer` |
| **reviewer** | 2.0.0 | 2026-03-24 | Consolidation of `code-reviewer` + `pr-review-fixer` |
| **test-writer** | 2.0.0 | 2026-03-24 | Expanded with E2E mode (absorbed `test-write-e2e`) |
| **quality** | 2.0.0 | 2026-03-24 | Consolidation of `performance-auditor` + `sonar-auto-fixer` |
| **design-docs** | 2.0.0 | 2026-03-24 | Consolidation of `ui-designer` + `doc-designer` + `business-analyst` |
| **pr-lifecycle** | 1.0.0 | 2026-03-23 | Unchanged — kept as standalone autonomous agent |

---

## 📖 Semantic Versioning Rules

We follow [Semantic Versioning 2.0.0](https://semver.org/) conventions:

### MAJOR version (X.0.0)
Increment when making **incompatible changes**: changes to agent role/responsibilities that break existing workflows, removal of skills, breaking changes to validation gates.

### MINOR version (1.X.0)
Increment when adding **backwards-compatible functionality**: adding new skills, enhancing prompts without changing output contract.

### PATCH version (1.0.X)
Increment when making **backwards-compatible bug fixes**: fixing typos, correcting validation logic, documentation updates.

---

## 🔄 Version History

### 2026-03-24 — Consolidation v2.0.0

- **System restructure:** 14 agents consolidated into 7 to reduce cognitive overhead for solo/small team
- **architect (v2.0.0):** Merged `frontend-architect` (v1.0.0) + `coupling-analyzer` (v1.0.0). Coupling analysis is now a built-in skill (`/analyze-coupling`)
- **engineer (v2.0.0):** Merged `react-native-engineer` (v1.0.0) + `logic-engineer` (v1.0.0). Covers the complete Stage 1+2 pipeline
- **reviewer (v2.0.0):** Merged `code-reviewer` (v1.0.0) + `pr-review-fixer` (v1.0.0, was TODO). Added `/fix-pr` mode
- **test-writer (v2.0.0):** Absorbed `test-write-e2e` (v1.0.0). Unit + E2E in one agent with `/test-e2e` mode
- **quality (v2.0.0):** Merged `performance-auditor` (v1.0.0) + `sonar-auto-fixer` (v1.0.0). Two modes: `/audit-performance` and `/fix-sonar`
- **design-docs (v2.0.0):** Merged `ui-designer` (v1.0.0) + `doc-designer` (v1.0.0) + `business-analyst` (v1.0.0). Three modes: `/ui-polish`, README auto-update, `/business-to-sdd`
- **pr-lifecycle:** Kept at v1.0.0 — no changes, remains standalone
- **Deleted:** `frontend-architect.md`, `react-native-engineer.md`, `logic-engineer.md`, `code-reviewer.md`, `pr-review-fixer.md`, `test-write-e2e.md`, `performance-auditor.md`, `sonar-auto-fixer.md`, `coupling-analyzer.md`, `ui-designer.md`, `doc-designer.md`, `business-analyst.md`
- **Updated:** `system.md` routing matrix, classification logic, agent registry; `agents-orchestration.md` all diagrams; `agents/README.md`; `router/router.md`; all `.claude/commands`; `README.md` root

### 2026-03-23 — System Initialization (v1.0.0)

- **All 14 Agents (v1.0.0):** Initial production release with full metadata and versioning support
- Established baseline for future version tracking
- Created token economics tracking and analysis system

---

## 🔗 Related Documentation

- **Architecture Overview:** See [docs/architecture.md](../docs/architecture.md)
- **Token Economics:** See [router/token-analysis.md](../router/token-analysis.md)
- **Orchestrator Guide:** See [docs/orchestrator-quick-reference.md](../docs/orchestrator-quick-reference.md)

---

## 📝 Version Tracking Guidelines

When updating an agent:

1. Update version number in agent header
2. Add entry to this CHANGELOG with date and description
3. Update `system.md` if routing logic changes
4. Run validation suite to ensure no regressions

---

**Last Updated:** 2026-03-24 by Eugénio Silva
