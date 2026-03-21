# Storage and Repositories

## Local Cache

- `localCache` stores lists and entities with a last-updated timestamp per key.
- Repository `list()` and `getById()` methods read from this cache.

## Offline Queue

- `offlineQueue` enqueues PUT/DELETE operations that represent desired server state.
- The queue is processed by `processOfflineQueue()` (in the sync service).

## Repositories

- Each repository (topics, summaries, challenges) encapsulates local mutations and enqueuing.
- `upsert(entity, syncUrl, { fromSync? })` writes to caches and enqueues when `fromSync` is false.
- Deletions cascade where appropriate (e.g., deleting a Summary removes its Challenges locally and enqueues deletes).

## Firestore Mirroring

- Immediate mirroring is disabled in repositories to avoid loops.
- `collabFlush.service.ts` centralizes selective mirroring on explicit triggers.
- Last mirrored `updatedAt` is tracked per entity.

See also: [[Sync and Collaboration]].
