# Sync and Collaboration

Syntry aims to be offline-first while supporting real-time collaboration.

## Overview

- Local-first: changes are written to a local cache and queued in an `offlineQueue`.
- Real-time: Firestore listeners hydrate local data for Topics (created by me or where I am a member), and their Summaries and Challenges.
- Controlled mirroring: Local changes are mirrored to Firestore only on explicit triggers to avoid echo loops.

## Key pieces

- `collabSync.service.ts`:
  - Listens to Firestore docs for relevant Topics.
  - For each Topic, attaches listeners for Summaries and Challenges.
  - On snapshot changes, upserts into repositories with `{ fromSync: true }`.
- `collabFlush.service.ts`:
  - Scans `offlineQueue` for PUTs and mirrors changed entities to Firestore if `updatedAt` is newer than last mirrored value.
  - De-duplicates mirrors per-entity via `localCache` markers.
- `immediateFlush.ts`:
  - Helper to run `processOfflineQueue()` followed by `flushLocalCollaborativeChanges()` with a timeout to avoid hanging the UI.

## Triggers

- Dashboard focus: processes the offline queue and then flushes collaborative changes.
- Challenges list focus: ensures the list is up-to-date and backfills from Firestore by `summaryId`.
- After finishing a challenge: performs an immediate flush so collaborators see results right away.
- After creating a summary in a shared topic: immediate flush to share content instantly.

## Loop avoidance

- All repository `upsert` methods accept `fromSync` to skip enqueuing a new mirror.
- Firestore listeners always call repositories with `fromSync: true`.

See also: [[Storage and Repositories]].
