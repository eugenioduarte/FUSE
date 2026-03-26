---
name: api-integration
description: API integration patterns for DTO boundaries, service design, query orchestration, and testable transport code.
allowed-tools: Read, Grep, Write, Edit
---

# API Integration

Use this skill when creating or reviewing services, DTOs, query hooks, and adapters.

Rules:

- keep DTOs at the edge
- translate into models before UI use
- centralize transport details inside services
- keep query orchestration above services

Use templates from `assets/` for new modules.
