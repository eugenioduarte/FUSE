# Getting Started

This guide helps you set up Fuse locally.

## Prerequisites

- macOS or Linux (Windows works via WSL2)
- Node.js (LTS), Yarn (Berry is used in this repo)
- Xcode and/or Android Studio (for iOS/Android builds)
- Expo CLI (optional), EAS CLI (optional)
- Firebase project (Auth + Firestore)
- Optional: OpenAI API key (for AI-generated summaries and questions)

## Clone and install

```bash
# Clone the repo
git clone https://github.com/eugenioduarte/Fuse
cd Fuse

# Install dependencies
yarn
```

## Environment variables

Create a `.env` or use Expo public env vars (preferred):

- `EXPO_PUBLIC_OPENAI_API_KEY` (optional for AI features)
- `EXPO_PUBLIC_OPENAI_MODEL` (default: `gpt-4o-mini`)
- `EXPO_PUBLIC_OPENAI_BASE_URL` (optional)

Configure Firebase in `src/services/firebase/firebaseInit.ts` (or equivalent) with your Firebase app config. Ensure Firestore and Auth are enabled.

## Run the app

```bash
# Start Metro bundler
yarn start

# iOS Simulator
yarn ios

# Android Emulator
yarn android
```

## Tests

```bash
yarn test
```

Pre-push hooks run Jest. Commits use Conventional Commits; commit messages are validated.

## First run checklist

- Sign in or create a user via Firebase Auth flows in-app
- Create a Topic
- Generate an AI Summary inside the Topic
- Add a Challenge (Quiz, Matrix, Hangman, or Text Answer)
- Optionally invite a connection and accept the invite to test collaboration

Next: [[Project Structure]].
