> **[PT]** Este ficheiro contém o relatório de auditoria de segurança OWASP MAS da aplicação Sonae PlugCharge App Frotas, documentando 16 findings identificados (2 críticos, 4 altos, 5 médios, 3 baixos, 2 informativos) com evidências e recomendações de remediação.

---

# Security Audit Report — OWASP MAS
## Sonae PlugCharge App Frotas — React Native (Expo)

**Date:** 2026-03-13
**Methodology:** OWASP MASVS / MASTG / MASWE
**Agents used:** SA-1 to SA-7
**App context:** Electric charging management application for corporate fleets. Handles authentication, user sessions and potentially charging transactions → classified as **MEDIUM-HIGH sensitivity**.

---

## Executive Summary

| Severity | No. of Findings |
|----------|----------------|
| 🔴 CRITICAL | 2 |
| 🟠 HIGH     | 4 |
| 🟡 MEDIUM   | 5 |
| 🟢 LOW      | 3 |
| ℹ️ INFO     | 2 |

---

## Findings

---

### STORAGE-001 — MMKV Encryption Key Hardcoded in Source Code

| Field | Value |
|-------|-------|
| **ID** | STORAGE-001 |
| **Severity** | 🔴 CRITICAL |
| **MASVS** | MASVS-CRYPTO-2, MASVS-STORAGE-1 |
| **MASWE** | MASWE-0015 |
| **Platform** | Android + iOS |

**Evidence:**

```typescript
// src/lib/storage/localStorage.ts:8-9
encryptionKey:
  Constants.expoConfig?.extra?.storageEncryptionKey ?? '9db0e9f8-3b60-4d82-9a9e-70d4e606feca',

// src/lib/tanstack/query/persistQueries.ts:22-23
encryptionKey:
  Constants.expoConfig?.extra?.storageEncryptionKey ?? '9db0e9f8-3b60-4d82-9a9e-70d4e606feca',
```

**Description:**
The MMKV encryption key has a hardcoded fallback value (`9db0e9f8-3b60-4d82-9a9e-70d4e606feca`) directly in the source code. If the `storageEncryptionKey` variable is not configured in `expoConfig.extra` (e.g. in dev builds or CI), all persisted data will be encrypted with a known and public key. Anyone with access to the repository can decrypt the storage of any device.

**Recommendation:**
Remove the fallback. Generate the key by deriving it from the Keystore/Secure Enclave (e.g. via `expo-secure-store` or `react-native-keychain`) or ensure that `storageEncryptionKey` is mandatory in all environments — with an explicit failure if absent.

---

### NETWORK-001 — Google Maps API Key Exposed in AndroidManifest.xml

| Field | Value |
|-------|-------|
| **ID** | NETWORK-001 |
| **Severity** | 🔴 CRITICAL |
| **MASVS** | MASVS-CODE-2 |
| **MASWE** | MASWE-0015 |
| **Platform** | Android |

**Evidence:**

```xml
<!-- android/app/src/main/AndroidManifest.xml:21 -->
<meta-data android:name="com.google.android.geo.API_KEY"
           android:value="AIzaSyCz7XjxeRl8m3JCc_Abzn80sirGNM4Vb70"/>
```

**Description:**
A Google Maps API key is hardcoded in `AndroidManifest.xml` and committed to the repository. Anyone with access to the APK or source code can reuse it, incurring unauthorized costs and potential quota abuse.

**Recommendation:**
Revoke this key immediately in the Google Cloud Console. Use the environment variable `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` via `app.config.ts`/`app.json` and inject it via Expo EAS Secrets, never as a literal in the file.

---

### STORAGE-002 — PIN Stored in Plaintext (without hash)

| Field | Value |
|-------|-------|
| **ID** | STORAGE-002 |
| **Severity** | 🟠 HIGH |
| **MASVS** | MASVS-AUTH-2, MASVS-STORAGE-1 |
| **MASTG** | MASTG-TEST-0018 |
| **Platform** | Android + iOS |

**Evidence:**

```typescript
// src/screens/onboarding/pin-setup/pin-setup.tsx:29
await SecureStore.setItemAsync(PIN_KEY, pin)
```

**Description:**
The user's PIN is stored as plaintext in `expo-secure-store`. Although SecureStore uses the Keychain (iOS) / Keystore (Android), storing the raw value means that any leak of the store (e.g. non-excluded backup, extraction on a jailbroken device) immediately exposes the PIN. The PIN must be derived/hashed before persisting.

**Recommendation:**
Derive the PIN with PBKDF2 or bcrypt (using `expo-crypto` or `@noble/hashes`) with a random salt before persisting. On verification, recompute the hash and compare — never compare the plaintext value.

---

### AUTH-001 — Weak PIN Policy and No Lockout

| Field | Value |
|-------|-------|
| **ID** | AUTH-001 |
| **Severity** | 🟠 HIGH |
| **MASVS** | MASVS-AUTH-3 |
| **MASWE** | MASWE-0040 |
| **Platform** | Android + iOS |

**Evidence:**

```typescript
// src/screens/onboarding/pin-setup/pin-setup.tsx:20-21
if (pin.length < 4) {
  Alert.alert('Invalid PIN', 'The PIN must have at least 4 digits')
```

**Description:**
The minimum of 4 numeric digits represents only 10,000 possible combinations. No lockout or attempt limit logic was found — an attacker can brute-force the PIN without restriction.

**Recommendation:**
Implement lockout after 5 incorrect attempts (e.g. session wipe or exponential backoff). Consider a minimum of 6 digits or allow alphanumeric PIN. Bind the PIN to a key in the Keystore (CryptoObject-based auth).

---

### PLATFORM-001 — `android:allowBackup="true"` Without Exclusion Rules

| Field | Value |
|-------|-------|
| **ID** | PLATFORM-001 |
| **Severity** | 🟠 HIGH |
| **MASVS** | MASVS-STORAGE-2 |
| **MASTG** | MASTG-TEST-0004 |
| **Platform** | Android |

**Evidence:**

```xml
<!-- android/app/src/main/AndroidManifest.xml:20 -->
android:allowBackup="true"
```

**Description:**
Android's automatic backup is active without exclusion rules (`android:fullBackupContent`). This means the MMKV content (storage encrypted with the hardcoded fallback key — see STORAGE-001) can be included in ADB or Google Backup backups, potentially exposing session data.

**Recommendation:**
Create `res/xml/backup_rules.xml` excluding MMKV files (`QUERY_STORAGE`, `LOCAL_STORAGE`) and reference via `android:fullBackupContent="@xml/backup_rules"`. On Android 12+, also use `android:dataExtractionRules`.

---

### RESILIENCE-001 — Absence of Root/Jailbreak Detection

| Field | Value |
|-------|-------|
| **ID** | RESILIENCE-001 |
| **Severity** | 🟠 HIGH |
| **MASVS** | MASVS-RESILIENCE-1 |
| **MASWE** | MASWE-0097 |
| **Platform** | Android + iOS |

**Evidence:**
No reference to `react-native-device-info` (isRooted), Play Integrity API, App Attest, or any root/jailbreak detection module in the `package.json` dependencies.

**Description:**
The app does not detect if it is running on a rooted/jailbroken device. On compromised devices, certificate pinning (absent — see NETWORK-002), Keystore/Keychain and biometrics can be bypassed. For an app handling user sessions and corporate charging, the absence is HIGH.

**Recommendation:**
Integrate Play Integrity API (Android) via native module and App Attest (iOS 14+). Complement with `expo-device` for basic client-side checks. Validate the attestation token server-side before allowing sensitive operations.

---

### NETWORK-002 — Certificate Pinning Absent

| Field | Value |
|-------|-------|
| **ID** | NETWORK-002 |
| **Severity** | 🟡 MEDIUM |
| **MASVS** | MASVS-NETWORK-2 |
| **MASTG** | MASTG-TEST-0020 |
| **Platform** | Android + iOS |

**Evidence:**
`react-native-ssl-pinning`, `trustkit` or equivalent are not in the dependencies. No pinning configuration in Android Network Security Config.

**Description:**
Without certificate pinning, communications with the API and Supabase can be intercepted via MITM with a proxy (Burp, mitmproxy) by installing a user CA. Relevant for this corporate app context with fleet data.

**Recommendation:**
Implement public key pinning for critical endpoints (REST API + Supabase). Use `react-native-ssl-pinning` or `network_security_config.xml` configuration on Android. Configure a backup pin to allow rotation without downtime.

---

### CODE-001 — `transform-remove-console` Absent in Production Build

| Field | Value |
|-------|-------|
| **ID** | CODE-001 |
| **Severity** | 🟡 MEDIUM |
| **MASVS** | MASVS-STORAGE-2, MASVS-CODE-2 |
| **MASWE** | MASWE-0005 |
| **Platform** | Android + iOS |

**Evidence:**

```javascript
// babel.config.js — without transform-remove-console
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin', ['module-resolver', { ... }]],
  }
}
```

`RestClient.ts` uses `logger.info(...)` with URLs and `logger.error(...)` with request/response details in all environments.

**Description:**
Without the babel plugin `transform-remove-console`, all `console.log/info/error` (including logs via `Logger`) remain active in production. Network logs with URLs, status codes and error messages are visible via ADB logcat or debugging tools.

**Recommendation:**
Add to `babel.config.js` for production:
```javascript
...(process.env.NODE_ENV === 'production' && {
  plugins: [['transform-remove-console', { exclude: ['error', 'warn'] }]]
})
```

---

### PLATFORM-002 — Potentially Excessive Android Permissions

| Field | Value |
|-------|-------|
| **ID** | PLATFORM-002 |
| **Severity** | 🟡 MEDIUM |
| **MASVS** | MASVS-PRIVACY-1 |
| **Platform** | Android |

**Evidence:**

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
```

**Description:**
- `READ/WRITE_EXTERNAL_STORAGE`: Obsolete on Android 10+ (scoped storage). Can be removed or replaced by `READ_MEDIA_*`.
- `SYSTEM_ALERT_WINDOW`: A very powerful overlay permission (allows drawing over other apps). Must be justified and requested only when strictly necessary.
- `RECORD_AUDIO`: Its usefulness in a fleet charging app is not evident. Should be audited if it is actually being used.

**Recommendation:**
Audit each permission against the code that uses it. Remove unused ones. Add clear purpose strings in `Info.plist` (iOS) for sensitive permissions.

---

### PLATFORM-003 — Deep Links with Custom URI Scheme Without App Links/Universal Links

| Field | Value |
|-------|-------|
| **ID** | PLATFORM-003 |
| **Severity** | 🟡 MEDIUM |
| **MASVS** | MASVS-PLATFORM-1 |
| **MASTG** | MASTG-TEST-0026 |
| **Platform** | Android + iOS |

**Evidence:**

```xml
<!-- android/app/src/main/AndroidManifest.xml:34-35 -->
<data android:scheme="mobiledev"/>
<data android:scheme="exp+plug-charge-pro"/>
```

**Description:**
Deep links use custom URI schemes (`mobiledev://`, `exp+plug-charge-pro://`). Any other Android app can register the same schemes and intercept OAuth callbacks or internal navigation, potentially capturing authorization codes.

**Recommendation:**
For authentication flows (OAuth callback), migrate to App Links (Android) with `https://` scheme and a verified `assetlinks.json` file on the server, and Universal Links (iOS) with `apple-app-site-association`. The `exp+plug-charge-pro` scheme should be replaced in production.

---

### STORAGE-003 — TanStack Query Persists API Data in MMKV Without Content Control

| Field | Value |
|-------|-------|
| **ID** | STORAGE-003 |
| **Severity** | 🟡 MEDIUM |
| **MASVS** | MASVS-STORAGE-1 |
| **Platform** | Android + iOS |

**Evidence:**

```typescript
// src/lib/tanstack/query/persistQueries.ts
export const queryClientPersister = createAsyncStoragePersister({
  storage: queryStorageAdapterAsync,
  key: 'QUERY_STORAGE',
  // persists entire query cache
})
```

**Description:**
The entire TanStack Query cache (including API responses with user data, vehicles, charging points) is persisted in MMKV. Although MMKV is configured with encryption, the key has the hardcoded fallback (see STORAGE-001). Additionally, in `__DEV__` mode data is stored as plain JSON without compression — potentially including sensitive data.

**Recommendation:**
Configure `queryClient.defaultOptions.queries` to exclude sensitive queries from persistence (via `meta: { persist: false }`). Ensure that authentication/credentials data does not enter the persisted cache.

---

### AUTH-002 — Session Without Inactivity Timeout

| Field | Value |
|-------|-------|
| **ID** | AUTH-002 |
| **Severity** | 🟢 LOW |
| **MASVS** | MASVS-AUTH-3 |
| **Platform** | Android + iOS |

**Description:**
No inactivity-based session timeout logic was found. The `AppState` listener and Supabase's `autoRefreshToken: true` are configured, but there is no automatic session invalidation after a period of inactivity.

**Recommendation:**
Implement a session timeout (e.g. 15-30 min of inactivity) using `AppState` and a resettable timer. In a corporate app, the session policy should be configurable via Remote Config.

---

### CODE-002 — expo-dev-client and expo-dev-menu in Production Dependencies

| Field | Value |
|-------|-------|
| **ID** | CODE-002 |
| **Severity** | 🟢 LOW |
| **MASVS** | MASVS-CODE-2 |
| **Platform** | Android + iOS |

**Evidence:**

```json
// package.json
"expo-dev-client": "~6.0.18",
"expo-dev-menu": "^7.0.18",
```

**Description:**
`expo-dev-client` and `expo-dev-menu` are in `dependencies` (not `devDependencies`). Although in EAS production builds these features are disabled, their presence in dependencies may include unnecessary debug code in the bundle.

**Recommendation:**
Move to `devDependencies` or ensure that `eas.json` uses the `production` profile that excludes these dependencies.

---

### CODE-003 — Absence of Forced Update Mechanism

| Field | Value |
|-------|-------|
| **ID** | CODE-003 |
| **Severity** | 🟢 LOW |
| **MASVS** | MASVS-CODE-4 |
| **Platform** | Android + iOS |

**Description:**
No forced update mechanism was found (minimum version comparison with server). `expo-updates` is disabled in the manifest (`expo.modules.updates.ENABLED=false`). If a version with a critical vulnerability is distributed, there is no way to force an update.

**Recommendation:**
Implement minimum version verification via Firebase Remote Config (already integrated) at app startup. Block access and redirect to the store if the version is below the configured minimum.

---

### INFO-001 — Supabase AnonKey Loaded via Remote Config

| Field | Value |
|-------|-------|
| **ID** | INFO-001 |
| **Severity** | ℹ️ INFO |
| **MASVS** | MASVS-CODE-2 |
| **Platform** | Android + iOS |

**Evidence:**

```typescript
// src/lib/supabase/client/client.ts:59
const { url, anonKey } = remoteConfig.supabaseApp
```

**Description:**
The Supabase `anonKey` is loaded via Firebase Remote Config, which is a good practice to avoid hardcoding. However, the Supabase `anonKey` is by design a public key — security is guaranteed by Row Level Security (RLS) policies on the server side. Confirm that RLS is correctly configured in the Supabase project.

**Recommendation:**
Verify that the Supabase project has RLS active on all tables with sensitive data. The `anonKey` is not a secret, but access must always be validated by the policies.

---

### INFO-002 — Hermes Enabled (Positive)

| Field | Value |
|-------|-------|
| **ID** | INFO-002 |
| **Severity** | ℹ️ INFO |
| **Platform** | Android + iOS |

**Description:**
The project uses React Native 0.81.5 with Expo 54, where the Hermes engine is enabled by default. Hermes compiles JavaScript to bytecode, making bundle analysis harder (but not impossible). This is a positive point for basic resilience.

---

## Risk Matrix

| ID | Title | Severity | Remediation Effort |
|----|-------|----------|--------------------|
| STORAGE-001 | Hardcoded MMKV key | 🔴 CRITICAL | Medium |
| NETWORK-001 | Exposed Google Maps API Key | 🔴 CRITICAL | Low |
| STORAGE-002 | PIN in plaintext | 🟠 HIGH | Medium |
| AUTH-001 | Weak PIN policy / no lockout | 🟠 HIGH | Medium |
| PLATFORM-001 | allowBackup without exclusions | 🟠 HIGH | Low |
| RESILIENCE-001 | No root/jailbreak detection | 🟠 HIGH | High |
| NETWORK-002 | Certificate Pinning absent | 🟡 MEDIUM | High |
| CODE-001 | Console logs in production | 🟡 MEDIUM | Low |
| PLATFORM-002 | Excessive Android permissions | 🟡 MEDIUM | Low |
| PLATFORM-003 | Custom URI Schemes without App Links | 🟡 MEDIUM | Medium |
| STORAGE-003 | TanStack Query persists data without control | 🟡 MEDIUM | Medium |
| AUTH-002 | No session timeout | 🟢 LOW | Medium |
| CODE-002 | Dev tools in prod dependencies | 🟢 LOW | Low |
| CODE-003 | No forced update | 🟢 LOW | Low |

---

## Positive Points Identified

- **SecureStorage well used**: refresh tokens and credentials stored via `expo-secure-store` (Keychain/Keystore).
- **MMKV with encryption**: MMKV configured with `encryptionKey` (the fallback is the problem, not the absence of encryption).
- **Supabase HTTPS mandatory**: explicit HTTPS protocol validation at client initialization.
- **Differentiated storage adapter**: clear logic separating sensitive data (SecureStore) from non-sensitive data (MMKV).
- **Automatic token refresh**: refresh token rotation logic implemented in the axios interceptor.
- **Zod present**: schema validation library available for external data validation.
- **`expo-crypto` and `@noble/hashes`**: modern cryptography libraries available.
- **Hermes enabled**: bytecode compilation active by default.

---

*Report generated based on static source code analysis. It is recommended to complement with dynamic analysis (Burp Suite, Frida) and testing on a physical device.*
