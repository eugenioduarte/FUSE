---
name: security-resilience
description: Audit anti-tampering, root/jailbreak detection, anti-debug posture, integrity checks, and obfuscation maturity.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Security Resilience

Review:

- root and jailbreak detection depth
- debugger, emulator, Frida, and hooking detection
- bundle or binary integrity validation
- signing posture and attestation
- JS/native obfuscation and runtime self-protection

Severity must reflect app sensitivity. For low-sensitivity apps, missing resilience may be a warning; for critical apps, it can be high severity.
