---
name: security-crypto
description: Audit cryptographic algorithms, randomness, key handling, and secret placement for React Native applications.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Security Crypto

Review:

- weak or prohibited algorithms
- insecure cipher modes, IV handling, and padding
- `Math.random()` or predictable entropy in security contexts
- hardcoded keys, secrets, salts, or IVs
- platform key management through Keychain, Keystore, or Secure Enclave

Prefer findings that separate checksum use from real security use and identify whether the issue is critical, high, or hardening-only.
