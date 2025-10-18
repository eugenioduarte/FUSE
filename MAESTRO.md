Maestro quickstart for this repo

Maestro is a CLI and framework for running E2E tests on mobile apps.

1. Install maestro (macOS):

```bash
# Install via npm
npm install -g maestro-cli
# or with brew (if available):
# brew tap maestroapp/maestro
# brew install maestro
```

2. Start the app in Expo (on simulator or device):

```bash
# start expo
yarn start
# open simulator via expo dev tools or run
# yarn ios or yarn android
```

3. Run the maestro test:

```bash
# from repo root
maestro test .maestro/login_test.yaml --target simulator
```

Notes:

- The test expects the app to expose elements with testIDs used in the repo.
- `app: "expo://"` is a placeholder. Adjust target details per Maestro docs if needed.
- If using a physical device, follow Maestro docs to connect and target the device.
- You may need to tweak timeouts based on device performance.
