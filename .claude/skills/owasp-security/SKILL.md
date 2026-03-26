---
name: owasp-security
description: OWASP MAS orchestration skill for React Native audits across storage, crypto, network, auth, platform, code, and resilience domains.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# OWASP Security

Use this skill as the umbrella coordinator for a complete React Native security review.

Operating model:

- establish scope first: source code, manifests, binaries, or mixed review
- classify app sensitivity: low, medium, high, critical
- review each domain with the dedicated security skill
- map findings to MASVS controls whenever possible
- report by severity, affected surface, exploitability, and remediation priority

Domain pack:

- `security-storage`
- `security-crypto`
- `security-network`
- `security-auth`
- `security-platform`
- `security-code`
- `security-resilience`

Prefer concrete findings with evidence, platform scope, and React Native-specific remediation guidance.
