---
name: project-architecture
description: Pushy architecture guidance for layer contracts, feature structure, and cross-cutting system consistency.
allowed-tools: Read, Grep, Glob
---

# Project Architecture

Apply this skill on any architecture question, new feature structure, or refactor touching multiple layers.

Core contract:

`Model -> Service -> Query -> Hook -> Screen`

Never bypass the hook boundary for UI orchestration. Prefer feature co-location and explicit contracts over convenience abstractions.
