# Release and Deployment

## Local builds

- Use Expo CLI for development builds; EAS for distribution builds.
- Ensure iOS/Android credentials are configured in EAS prior to production builds.

## Pre-release checklist

- All tests pass.
- No type errors.
- Manual smoke test of:
  - Topic create, AI Summary generate
  - Challenge run and finish (with syncing overlay)
  - Invites and acceptance flow in a shared Topic

## Notes

- This project relies on Firestore; confirm rules and indexes as needed.
- If you alter Firestore doc shapes, update listeners and repositories accordingly.
