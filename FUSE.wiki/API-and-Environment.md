# API and Environment

## Environment Variables

### Anthropic (AI)

| Variable                        | Client bundle | Description                                                                                                                             |
| ------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_ANTHROPIC_MODEL`   | ✅ Safe       | Model name; default `claude-haiku-4-5`                                                                                                  |
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | ❌ Dev only   | **Never in prod bundle.** Only for local dev if you need to bypass auth. In prod, the key lives exclusively in Firebase Secret Manager. |

### Firebase

| Variable                       | Description                      |
| ------------------------------ | -------------------------------- |
| `FIREBASE_API_KEY`             | Firebase Web API key             |
| `FIREBASE_AUTH_DOMAIN`         | `<project>.firebaseapp.com`      |
| `FIREBASE_PROJECT_ID`          | Firebase project ID              |
| `FIREBASE_STORAGE_BUCKET`      | Storage bucket URL               |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID for push notifications |
| `FIREBASE_APP_ID`              | Firebase App ID                  |

All Firebase vars are injected via `app.config.js` → `expo.extra.firebase` at build time (never `EXPO_PUBLIC_`).

## AI Architecture

### Target (production)

```
App (signed-in user)
  │
  │  firebase/functions httpsCallable('anthropicProxy')
  │  ← Firebase SDK auto-injects ID token via onCall ─────────►  Firebase Function: anthropicProxy
  │                                                                 │ request.auth verified automatically
  │                                                                 │ ANTHROPIC_API_KEY from Secret Manager
  │                                                                 └──► Anthropic API → { text }
  ◄──────────────────────────── result.data.text ──────────────────
```

- `firebase/functions` is part of the `firebase@^12.11.0` package already in `package.json` — no extra install.
- The `anthropicProxy` function lives in `functions/src/index.ts` and uses `firebase-functions/v2/https` `onCall`.
- `request.auth` is verified server-side; unauthenticated requests throw `HttpsError('unauthenticated')`.
- Secret setup: `firebase functions:secrets:set ANTHROPIC_API_KEY` — never in code or `.env`.
- Deploy: `firebase deploy --only functions`

### Local dev (no deploy needed)

When `getFirebaseAuth().currentUser` is null (not signed in or emulator without auth), `aiService` returns deterministic mock data — same behaviour as before.

### Emulator testing

```bash
firebase emulators:start --only functions
# In .env.local set FIREBASE_AUTH_EMULATOR_HOST and FIREBASE_FUNCTIONS_EMULATOR_HOST
# The client SDK automatically routes to the emulator when these vars are set
```

## Firebase Collections

- `topics` — with `createdBy` and `members` fields to scope listeners.
- `summaries` — `topicId`, `authorId`, content metadata.
- `challenges` — includes `summaryId`, and (for convenience) `topicId` when mirrored.

## Runtime stability

- Ensure Reanimated Babel plugin is last.
- Align Worklets native/JS versions; `runtimeVersion` policy is pinned in app config.
