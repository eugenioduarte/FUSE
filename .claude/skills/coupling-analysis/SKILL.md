---
name: coupling-analysis
description: Analyze fan-in, fan-out, layering violations, and cross-feature coupling before major refactors.
context: fork
allowed-tools: Read, Grep, Glob, Bash
---

# Coupling Analysis

Run before major structural changes and after large refactors.

Check for:

- God objects
- circular dependencies
- screen-to-service shortcuts
- unstable modules with high fan-out
- cross-feature leakage

Use `scripts/analyze-deps.sh` for quick dependency scans.
