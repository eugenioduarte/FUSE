# Syntry Wiki

Welcome to the Syntry project wiki. Syntry is a collaborative learning app where people create Topics, generate AI-powered Summaries, challenge each other with learning Challenges, and collaborate in real-time via shared Topics, invitations, and a simple social graph.

Use the sidebar to explore. Start with [[Getting Started]] and [[Project Structure]].

- [[Getting Started]]
- [[Project Structure]]
- [[Development Workflow]]
- [[Sync and Collaboration]]
- [[Invites and Connections]]
- [[Challenges]]
- [[Ranking]]
- [[UI and Animations]]
- [[Storage and Repositories]]
- [[Testing and Quality]]
- [[API and Environment]]
- [[Release and Deployment]]
- [[Troubleshooting]]
- [[Publish this Wiki]]

## Key features

- Topics and AI Summaries, including expandable terms and recommendations
- Four challenge types: Quiz, Matrix, Hangman, and Text Answer
- Per-challenge attempts, per-user scoring, and a simple Ranking view
- Collaborative Topics with invites, acceptance, and real-time visibility
- Robust sync model designed to avoid write loops and support offline-first behavior

## Tech stack (high-level)

- Mobile: Expo SDK 54, React Native 0.81, React 19
- Animations: Reanimated 4.x, react-native-worklets
- Data: Firebase (Auth + Firestore)
- State: Zustand stores
- Architecture: Local repository layer (local cache + offline queue), selective Firestore mirroring via explicit flush

---

For local repository folder details, see [[Project Structure]].
