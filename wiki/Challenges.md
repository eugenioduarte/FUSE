# Challenges

Syntry includes several challenge types to reinforce learning:

- Quiz: multiple choice questions generated from a Summary; options are shuffled.
- Matrix: word grid with target words derived from Summary content.
- Hangman: per-round word guessing with hints from the Summary.
- Text Answer: open-ended questions with AI-assisted evaluation.

## Attempts and scoring

- Each challenge stores attempts in its `payload` (`attempts` array) including `userId` and scores.
- A `lastAttempt` snapshot is kept for quick list rendering.

## Immediate propagation

- After finishing a challenge, we upsert the challenge locally and run an immediate flush (capped time) so collaborators see the completion quickly.
- The Challenges List screen also flushes and backfills from Firestore by `summaryId` on focus.

## Adding a new challenge type

1. Define the UI flow under `src/screens/main/challenge/`
2. Update navigation for run/review routes.
3. Persist attempts into the challenge’s `payload` (include `userId`).
4. Trigger an immediate flush after completion.
5. Ensure the list and ranking account for the new type if needed.

See also: [[Ranking]].
