---
name: security-code
description: Audit dependency risk, production build posture, input validation, and code-level exploitability.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Security Code

Review:

- outdated or vulnerable dependencies and missing dependency scanning
- debug configuration or secrets leaking into production artifacts
- bundle exposure, obfuscation posture, and release build protections
- SQL injection, path traversal, eval, deserialization, and unsafe native execution
- schema validation on untrusted data boundaries

Focus on exploitability and affected release surface, not only on code smell.
