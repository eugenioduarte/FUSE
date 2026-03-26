---
name: security-storage
description: Audit React Native storage, local persistence, logs, backups, and sensitive-data exposure against MASVS storage controls.
context: fork
allowed-tools: Read, Grep, Glob
model: sonnet
---

# Security Storage

Review:

- AsyncStorage, MMKV, SecureStore, Keychain, and Keystore usage
- SQLite, Realm, WatermelonDB, and file-system persistence
- JS bundle secrets and hardcoded sensitive values
- logs, clipboard, screenshots, backups, and UI exposure

Output expectations:

- cite the affected storage surface
- state whether data is plaintext, encrypted, or hardware-backed
- map to MASVS storage/privacy controls when possible
- distinguish Android, iOS, and shared React Native risks
