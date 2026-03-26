---
name: security-network
description: Audit transport security, TLS posture, certificate validation, and sensitive network flows for React Native apps.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Security Network

Review:

- cleartext traffic, ATS exceptions, and Android network security config
- TLS versions, weak ciphers, and trust bypasses
- certificate pinning and hostname verification
- sensitive data in URLs, logs, headers, or insecure metadata
- bridge, debug, and production transport differences

Always distinguish baseline failures from risk-based hardening items such as pinning.
