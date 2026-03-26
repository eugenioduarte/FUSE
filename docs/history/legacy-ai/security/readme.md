> **[PT]** Este ficheiro é o guia de uso e integração do sistema de agentes de segurança OWASP MAS, explicando como configurar e invocar os 7 subagentes especializados para auditoria de aplicações React Native.

---

# 🛡️ OWASP MAS Agent System — React Native
## Usage and Integration Guide

---

## 📁 File Structure

```
OWASP_MAS_Agents/
├── README.md                    ← This file
├── 00_ORCHESTRATOR_AGENT.md    ← Main agent prompt
├── SA1_STORAGE_AGENT.md        ← MASVS-STORAGE + MASVS-PRIVACY
├── SA2_CRYPTO_AGENT.md         ← MASVS-CRYPTO
├── SA3_NETWORK_AGENT.md        ← MASVS-NETWORK
├── SA4_AUTH_AGENT.md           ← MASVS-AUTH
├── SA5_PLATFORM_AGENT.md       ← MASVS-PLATFORM (WebViews, IPC, Deep Links)
├── SA6_CODE_AGENT.md           ← MASVS-CODE (deps, code quality, injection)
└── SA7_RESILIENCE_AGENT.md     ← MASVS-RESILIENCE (anti-tamper, obfuscation)
```

---

## 🚀 How To Use

### Option 1 — Claude Projects (Recommended)

1. Create a **Claude Project** called `OWASP RN Security Auditor`
2. In the **Project Instructions** field, paste the content of `00_ORCHESTRATOR_AGENT.md`
3. Upload all `SA*.md` files as **Project Knowledge**
4. Start a conversation with the project and say:

```
run owasp scan
```

The orchestrator will guide the process, call the sub-agents and produce the report.

---

### Option 2 — Direct Use with Code

Share your application code and activate:

```
Here is the code of my React Native app:
[paste the code or share the files]

run owasp scan
```

---

### Option 3 — Focused Scan by Domain

To audit only a specific domain, invoke the sub-agent directly:

```
Using the [SA-2] Cryptography Agent:
Analyze this code snippet to verify secure use of cryptography:

[paste the code]
```

---

### Option 4 — Claude API / Automation

```typescript
// Example integration with Claude API

const orchestratorPrompt = fs.readFileSync('00_ORCHESTRATOR_AGENT.md', 'utf-8');
const subAgentPrompts = {
  storage: fs.readFileSync('SA1_STORAGE_AGENT.md', 'utf-8'),
  crypto: fs.readFileSync('SA2_CRYPTO_AGENT.md', 'utf-8'),
  network: fs.readFileSync('SA3_NETWORK_AGENT.md', 'utf-8'),
  auth: fs.readFileSync('SA4_AUTH_AGENT.md', 'utf-8'),
  platform: fs.readFileSync('SA5_PLATFORM_AGENT.md', 'utf-8'),
  code: fs.readFileSync('SA6_CODE_AGENT.md', 'utf-8'),
  resilience: fs.readFileSync('SA7_RESILIENCE_AGENT.md', 'utf-8'),
};

// 1. Invoke orchestrator to get context + pipeline plan
// 2. Invoke each subagent in parallel (Phase 1)
// 3. Invoke dependent agents (Phase 2 + 3)
// 4. Send all results back to orchestrator for consolidation
```

---

## 🗺️ MASVS Coverage Mapping

| Sub-agent | MASVS Controls | MASWE IDs |
|-----------|----------------|-----------|
| SA-1 Storage | MASVS-STORAGE-1,2 + MASVS-PRIVACY-1,2,3,4 | 0001–0007, 0108–0117 |
| SA-2 Crypto | MASVS-CRYPTO-1,2 | 0009–0027 |
| SA-3 Network | MASVS-NETWORK-1,2 | 0047–0052 |
| SA-4 Auth | MASVS-AUTH-1,2,3 | 0028–0046 |
| SA-5 Platform | MASVS-PLATFORM-1,2,3 | 0053–0074, 0118 |
| SA-6 Code | MASVS-CODE-1,2,3,4 | 0075–0088, 0116 |
| SA-7 Resilience | MASVS-RESILIENCE-1,2,3,4 | 0089–0107 |

**Total: 118 MASWE weakness IDs covered**

---

## 📊 Severity Criteria

| Severity | Criteria | Remediation SLA |
|----------|----------|-----------------|
| 🔴 CRITICAL | Direct data exposure, RCE, complete auth bypass | 24–48h |
| 🟠 HIGH | Exploitable vulnerability with significant impact | 1 week |
| 🟡 MEDIUM | Incomplete mitigation, hardening needed | 1 month |
| 🟢 LOW | Missing best practice, low immediate risk | Next sprint |
| ℹ️ INFO | Informational observation, no direct risk | Backlog |

---

## 🔧 Prerequisites for Full Scan

For maximum coverage, provide:

- [ ] Source code (TypeScript/JavaScript)
- [ ] `android/AndroidManifest.xml`
- [ ] `android/app/build.gradle`
- [ ] `android/app/src/main/res/xml/network_security_config.xml` (if it exists)
- [ ] `ios/Info.plist`
- [ ] `ios/Podfile` and `ios/Podfile.lock`
- [ ] `package.json` and `package-lock.json` / `yarn.lock`
- [ ] `babel.config.js` and `metro.config.js`
- [ ] APK / IPA (for binary static analysis, if available)

---

## 📚 References

| Resource | URL |
|----------|-----|
| OWASP MASVS | https://mas.owasp.org/MASVS/ |
| OWASP MASTG | https://mas.owasp.org/MASTG/ |
| OWASP MASWE | https://mas.owasp.org/MASWE/ |
| MAS Checklist | https://mas.owasp.org/checklists/ |
| RN + OWASP Blog | https://owasp.org/blog/2024/10/02/Securing-React-Native-Mobile-Apps-with-OWASP-MAS |
| NVD CVE Search | https://nvd.nist.gov/vuln/search |
| Hermes CVEs | https://cve.mitre.org/cgi-bin/cvekey.cgi?keyword=hermes |
