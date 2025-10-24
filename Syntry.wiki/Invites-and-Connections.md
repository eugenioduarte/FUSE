# Invites and Connections

Syntry supports a lightweight social graph to collaborate within Topics.

## Connections

- Users can connect via email.
- Connection requests are stored in Firestore; notifications are sent to the target.
- Recipients can accept or decline. Accepted connections appear in a real-time list.

## Topic Invites

- Topics can be shared by inviting users via email or user ID.
- Before sending an invite, ensure the Topic exists in Firestore (promotion step for local-only topics).
- On acceptance:
  - Firestore `members` array is updated.
  - A local upsert of the Topic is performed immediately.
  - A membership sync runs so the invited user sees the Topic and its content quickly.

## Real-time visibility

- The collaboration listeners attach to Topics created by me and Topics where I am a member.
- After invitations are accepted, the invited user’s app listens to the Topic, its Summaries, and Challenges.

See also: [[Sync and Collaboration]].
