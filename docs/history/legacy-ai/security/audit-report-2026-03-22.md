# 🛡️ OWASP MAS Security Report — FUSE

**Date:** 2026-03-22
**RN Version:** 0.81.5 (Expo ~54.0.0)
**Platforms:** Android + iOS
**Engine:** Hermes (conditional via Expo)
**Architecture:** New Architecture (JSI) via Expo
**Analysis Type:** source_code

---

## 📊 Executive Summary

| Severity     | Count |
|--------------|-------|
| 🔴 CRITICAL  | 1     |
| 🟠 HIGH      | 2     |
| 🟡 MEDIUM    | 3     |
| 🟢 LOW       | 1     |
| ✅ PASS      | 8     |
| 🔍 MANUAL    | 3     |

**Security Score:** 62/100 — NEEDS_IMPROVEMENT

---

## ✅ Fixed in This PR (2026-03-22)

| ID | Issue | Fix Applied |
|----|-------|------------|
| STORAGE-001 | Firebase auth tokens stored in plaintext AsyncStorage | Migrated to expo-secure-store (iOS Keychain + Android Keystore) |
| PLATFORM-001 | WebView `originWhitelist={['*']}` too permissive | Restricted to `['about:*', 'data:*']` |
| CODE-001 | `Math.random()` for offline queue ID generation | Replaced with `crypto.randomUUID()` |
| CODE-002 | `Math.random()` for avatar seed generation | Replaced with `crypto.randomUUID()` |
| CODE-003 | console.log/warn in production builds | Added `transform-remove-console` babel plugin (excludes `console.error`) |

---

## 🔴 Critical Findings (Require Architecture Change)

### CRITICAL-001 — Anthropic API Key Exposed in Client Bundle
- **MASVS:** MASVS-STORAGE-1, MASVS-CODE-3
- **Status:** ⚠️ PARTIALLY MITIGATED
- **Evidence:** `src/services/ai/ai.service.ts:28` — `EXPO_PUBLIC_ANTHROPIC_API_KEY` is embedded in the JS bundle at build time (Expo's `EXPO_PUBLIC_` prefix is by design)
- **Risk:** Anyone who extracts the APK/IPA can read the bundle and obtain the API key. This allows unauthorized API calls, quota exhaustion, and billing abuse.
- **Current mitigation:** The `.env` file is gitignored; a server-side proxy note exists in the source comment; the app degrades gracefully when key is absent.
- **Required fix (Sprint 1):** Implement a lightweight backend proxy (e.g., Cloudflare Worker, Firebase Function, or Supabase Edge Function) that:
  1. Validates the Firebase ID token from the request
  2. Proxies to Anthropic API with a server-held key
  3. Applies per-user rate limiting
- **Action:** Create `functions/ai-proxy/` in a future sprint. Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` from client code.

---

## 🟠 High Findings (Require Future Sprint)

### HIGH-001 — Missing Root/Jailbreak Detection
- **MASVS:** MASVS-RESILIENCE-1
- **Status:** ❌ FAIL
- **Evidence:** No `react-native-device-info` isRooted(), SafetyNet, or Play Integrity API found
- **Risk:** On rooted/jailbroken devices, auth tokens and local data are accessible. For a medium-sensitivity app, this is HIGH.
- **Required fix (Sprint 2):**
  - Android: Integrate Play Integrity API (`@react-native-google-play-integrity`)
  - iOS: Integrate App Attest (Apple DeviceCheck)
  - Fallback: `react-native-device-info` for client-side heuristics
  - Validate attestation token server-side before allowing AI calls

### HIGH-002 — Firebase Credentials Embedded in Production Bundle
- **MASVS:** MASVS-STORAGE-1
- **Status:** ⚠️ PARTIALLY MITIGATED
- **Evidence:** `app.config.js` injects Firebase config from `.env` into Expo `extra` at build time → credentials embedded in bundle
- **Note:** Firebase web credentials (apiKey, projectId) are **designed** to be client-side and are protected by Firebase Security Rules. The real risk is Firestore rule misconfiguration.
- **Required fix (Sprint 2):**
  - Audit and harden Firebase Security Rules (ensure no unauthenticated read/write)
  - Consider dynamic config delivery for the most sensitive values

---

## 🟡 Medium Findings

### MEDIUM-001 — No Certificate Pinning
- **MASVS:** MASVS-NETWORK-2
- **Status:** ⚠️ WARNING
- **Affected endpoints:** `api.anthropic.com`, Firebase endpoints
- **Required fix (Sprint 3):** Android Network Security Config + iOS NSPinnedDomains for critical endpoints

### MEDIUM-002 — AsyncStorage for User Profile Data (Zustand persist)
- **MASVS:** MASVS-STORAGE-1
- **Status:** ⚠️ WARNING
- **Evidence:** `src/store/useAuthStore.ts` — persists `user.id`, `name`, `email`, `avatarUrl` in AsyncStorage
- **Note:** This is non-token user profile metadata. Firebase auth tokens are now secured (Fixed: STORAGE-001). This is lower risk.
- **Required fix (Sprint 3):** Migrate Zustand persist storage to `expo-secure-store` for `useAuthStore`

### MEDIUM-003 — `Math.random()` in Challenge Generation
- **MASVS:** MASVS-CRYPTO-1
- **Status:** ⚠️ WARNING
- **Files:** `use-challenge-run-quiz.ts`, `use-challenge-run-hangman.ts`, `use-challenge-matrix.ts`
- **Note:** Non-security-critical usage (game shuffling, not token/key generation). Low actual risk.
- **Required fix (Backlog):** Replace with `crypto.getRandomValues()` for consistency

---

## 🟢 Low Findings

### LOW-001 — Debug Flags (`DEBUG_CHAT = false`)
- **Status:** ACCEPTABLE
- **Evidence:** `src/services/firebase/chat.service.ts:25` — `const DEBUG_CHAT = false`
- **Recommendation:** Replace with `__DEV__` for env-based control. No security impact since value is `false`.

---

## ✅ PASS Controls

| Control | Status | Notes |
|---------|--------|-------|
| MASVS-NETWORK-1 | ✅ PASS | All external calls use HTTPS |
| MASVS-NETWORK-1 (iOS ATS) | ✅ PASS | `NSAllowsArbitraryLoads = false` |
| MASVS-NETWORK-1 (Android) | ✅ PASS | No `usesCleartextTraffic="true"` |
| MASVS-CODE-4 (SQL injection) | ✅ PASS | All SQLite queries use parameterized `?` placeholders |
| MASVS-CODE-2 (eval) | ✅ PASS | No `eval()` usage detected |
| MASVS-CODE-2 (dangerouslySetInnerHTML) | ✅ PASS | Not used (RN-only codebase) |
| MASVS-CRYPTO-1 (weak algorithms) | ✅ PASS | No MD5, SHA-1, DES, RC4, or ECB detected |
| MASVS-NETWORK-2 (rejectUnauthorized) | ✅ PASS | No SSL bypass found |

---

## 🔍 Manual Required

| Item | Why Manual |
|------|-----------|
| Firebase Security Rules | Server-side rules must be reviewed separately |
| Push notification auth | Expo Push Token validates on their server; review token storage |
| Certificate pinning bypass | Requires Burp/Frida testing on real device |

---

## 🎯 Prioritized Remediation Roadmap

### Sprint 1 — Critical (1–2 weeks)
- [ ] Implement AI backend proxy to remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` from client

### Sprint 2 — High (1 month)
- [ ] Integrate Play Integrity API (Android) + App Attest (iOS)
- [ ] Audit Firebase Security Rules

### Sprint 3 — Medium (2 months)
- [ ] Certificate pinning for `api.anthropic.com` + Firebase
- [ ] Migrate Zustand `useAuthStore` persist to `expo-secure-store`

### Backlog — Low
- [ ] Replace `Math.random()` in challenge hooks with `crypto.getRandomValues()`
- [ ] Replace `DEBUG_CHAT` flag with `__DEV__` check

---

## 📚 References
- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP MASTG: https://mas.owasp.org/MASTG/
- Play Integrity API: https://developer.android.com/google/play/integrity
- expo-secure-store: https://docs.expo.dev/versions/latest/sdk/securestore/
