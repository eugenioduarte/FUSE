# Troubleshooting

## Reanimated / Worklets mismatch

- Symptom: "Mismatch between JS part and native part of Worklets".
- Fix: Align versions and keep Reanimated Babel plugin last. We pin `runtimeVersion` to avoid mismatches.

## Collaborative write loops

- Symptom: repeated writes or infinite update cycles when mirroring to Firestore.
- Fix: Use repository `fromSync` flag for all Firestore listener upserts; centralize mirroring in the flush service.

## Challenges not visible for collaborators

- Ensure an immediate flush runs after finishing a challenge.
- On entering Challenges List, we query Firestore by `summaryId` to backfill any legacy docs.

## Overlay does not dismiss

- Immediate flush is capped by timeout; verify `immediateFlush` is called and `finally` path hides the overlay.

## Quiz answers always first

- Options are shuffled per question; confirm that you’re using the updated screen logic.

If issues persist, inspect `collabSync.service.ts` and `collabFlush.service.ts` logs and verify Firestore rules.
