# API and Environment

## Environment Variables

- `EXPO_PUBLIC_OPENAI_API_KEY` — Optional; enables AI-generated content.
- `EXPO_PUBLIC_OPENAI_MODEL` — Model name; default `gpt-4o-mini`.
- `EXPO_PUBLIC_OPENAI_BASE_URL` — Optional custom base.

## Firebase

- Configure Firebase app initialization and ensure Auth and Firestore are enabled.
- Collections used by collaboration:
  - `topics` — with `createdBy` and `members` fields to scope listeners.
  - `summaries` — `topicId`, `authorId`, content metadata.
  - `challenges` — includes `summaryId`, and (for convenience) `topicId` when mirrored.

## OpenAI (optional)

- Used to generate Summaries and challenge content.
- Fallbacks exist to mock content if no key is set.

## Runtime stability

- Ensure Reanimated Babel plugin is last.
- Align Worklets native/JS versions; `runtimeVersion` policy is pinned in app config.
