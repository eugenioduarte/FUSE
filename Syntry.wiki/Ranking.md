# Ranking

The Topic Ranking aggregates best scores per user across challenge runs.

## Data sources

- Challenge `payload.attempts` includes `userId`, `score`, `total`, and timestamps.
- The Ranking screen scans challenges for a Topic and computes best-per-challenge per user.

## Current logic

- For each challenge, consider the best attempt per user.
- Aggregate across all challenges in the Topic to produce a leaderboard.

## Extending

- Add weighting if certain challenge types should count more.
- Provide time windows (e.g., weekly/monthly) by filtering attempts.

See also: [[Challenges]].
