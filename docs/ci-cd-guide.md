# CI/CD Pipeline Guide

## 📋 Overview

FUSE implements a professional-grade CI/CD pipeline using GitHub Actions, demonstrating enterprise-level deployment practices. This setup showcases automated testing, code quality checks, and deployment automation suitable for production environments.

**🎯 Purpose:** This implementation serves as a portfolio showcase of modern DevOps practices. While the deployment steps are simulated (no actual app store submissions), the architecture and workflow mirror real-world production pipelines.

## 🏗️ Architecture

### CI Pipeline (Continuous Integration)

The CI pipeline runs automatically on every pull request and push to main/setup branches.

**Workflow:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

**Steps:**

1. **Code Checkout** - Fetches latest code
2. **Dependency Installation** - Installs packages with Yarn cache
3. **Linting** - ESLint with zero warnings policy
4. **TypeScript Check** - Validates type safety
5. **Unit Tests** - Jest with coverage collection
6. **Coverage Thresholds** - Enforces minimum quality standards
7. **SonarCloud Scan** - Static code analysis and security scanning

**Quality Gates:**

- ✅ ESLint: No warnings or errors
- ✅ TypeScript: No type errors
- ✅ Coverage: Min 60% branches, 70% functions, 75% lines/statements
- ✅ SonarCloud: Grade A quality rating

### CD Pipeline (Continuous Deployment)

The CD pipeline is triggered manually via GitHub Actions UI, simulating a production deployment process.

**Workflow:** [`.github/workflows/cd-simulated.yml`](../.github/workflows/cd-simulated.yml)

**Jobs:**

#### 1. Build Simulated

- Runs smoke tests
- Executes `expo prebuild` to generate native iOS/Android folders
- Simulates EAS Build for selected platform(s)
- Generates build artifacts and metadata

#### 2. Deploy Simulated

- Simulates App Store submission (iOS)
- Simulates Google Play submission (Android)
- Creates simulated GitHub Release
- Generates comprehensive release notes

#### 3. Post-Deploy Checks

- Verifies all artifacts were generated
- Creates deployment summary
- Validates deployment integrity

**Deployment Options:**

- **Environment:** development, preview, production
- **Platform:** iOS, Android, both
- **Version:** Semantic version (e.g., 1.0.0)

## 🚀 Usage

### Running CI Pipeline

The CI pipeline runs automatically. To trigger manually:

```bash
# Push to main branch
git push origin main

# Or open a pull request targeting main
gh pr create --base main
```

### Running CD Pipeline

1. Navigate to **Actions** tab in GitHub
2. Select **"CD - Simulated Deployment"** workflow
3. Click **"Run workflow"** button
4. Fill in the form:
   - **Environment:** Choose deployment target
   - **Platform:** Select iOS, Android, or both
   - **Version:** Enter semantic version (e.g., 2.1.0)
5. Click **"Run workflow"** to start

**Command line alternative:**

```bash
# Trigger via GitHub CLI
gh workflow run cd-simulated.yml \
  -f environment=production \
  -f platform=both \
  -f version=1.2.3
```

### Version Management

Use the version bump script to update version numbers consistently:

```bash
# Patch version (1.0.0 -> 1.0.1)
node scripts/version-bump.js patch

# Minor version (1.0.0 -> 1.1.0)
node scripts/version-bump.js minor

# Major version (1.0.0 -> 2.0.0)
node scripts/version-bump.js major
```

This updates:

- `package.json` version
- `app.json` expo.version
- iOS buildNumber (auto-incremented)
- Android versionCode (auto-incremented)

## 🔧 Configuration

### Environment Variables

The CI/CD pipeline uses these environment variables/secrets:

**CI Pipeline:**

- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `SONAR_TOKEN` - SonarCloud authentication (optional)

**CD Pipeline:**

- `DEPLOYMENT_ENV` - Target environment
- `DEPLOYMENT_PLATFORM` - Target platform
- `DEPLOYMENT_VERSION` - App version
- `BUILD_ID` - GitHub run ID
- `BUILD_NUMBER` - GitHub run number

### Coverage Thresholds

Configured in [`jest.config.js`](../jest.config.js):

```javascript
coverageThreshold: {
  global: {
    branches: 60,    // 60% branch coverage
    functions: 70,   // 70% function coverage
    lines: 75,       // 75% line coverage
    statements: 75,  // 75% statement coverage
  },
}
```

### SonarCloud Settings

Configured in [`sonar-project.properties`](../sonar-project.properties):

```properties
sonar.organization=eugeniosilva-portfolio
sonar.projectKey=eugeniosilva-portfolio_fuse
sonar.sources=src
sonar.tests=src
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

## 📦 Expo Workflow

**Current Setup:** Managed Workflow with Continuous Native Generation (CNG)

The project uses Expo's managed workflow where native `ios/` and `android/` folders are:

- ❌ Not committed to Git (in `.gitignore`)
- ✅ Generated automatically via `expo prebuild` in CI/CD
- ✅ Reproducible and consistent across environments

**Benefits:**

- Fewer merge conflicts in native code
- Cleaner Git history
- Aligned with Expo best practices
- Easy to migrate to bare workflow later if needed

**When Prebuild Runs:**

- CD pipeline (before building)
- Local development: `npx expo prebuild` when needed
- EAS Build: automatically handled

## 🎬 Deployment Simulation

### What Gets Simulated?

The CD pipeline simulates these real-world processes:

1. **EAS Build**
   - Native app compilation
   - Code signing
   - Asset bundling
   - Build artifact generation

2. **App Store Submission**
   - App Store Connect upload
   - TestFlight provisioning
   - Review queue placement
   - Metadata updates

3. **Google Play Submission**
   - Play Console upload
   - Track assignment (internal/beta/production)
   - Rollout percentage
   - Store listing updates

4. **Release Management**
   - GitHub Release creation
   - Release notes generation
   - Version tagging
   - Artifact archival

### Simulated vs Real

| Aspect           | Simulated               | Real Implementation                  |
| ---------------- | ----------------------- | ------------------------------------ |
| Build Process    | Console logs + metadata | Actual EAS Build API calls           |
| Store Submission | Simulated with links    | Real store API submissions           |
| Signing          | Skipped                 | Certificates + provisioning profiles |
| Duration         | ~30 seconds             | 10-30 minutes                        |
| Artifacts        | JSON report + markdown  | Actual .ipa/.apk files               |
| Visibility       | Full transparency       | Real app store listings              |

## 🔄 Converting to Real Deployment

To convert this simulated pipeline to real deployments:

### 1. Configure EAS Credentials

```bash
# Login to Expo
eas login

# Configure build credentials
eas credentials

# Configure iOS
eas credentials -p ios

# Configure Android
eas credentials -p android
```

### 2. Update GitHub Secrets

Add these secrets in GitHub repository settings:

**Required:**

- `EXPO_TOKEN` - Expo authentication token
- `APPLE_ID` - Apple Developer account email
- `APPLE_TEAM_ID` - Apple Team ID
- `APPLE_APP_SPECIFIC_PASSWORD` - App-specific password for App Store
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google Play service account JSON

**Optional:**

- `SLACK_WEBHOOK` - For deployment notifications
- `SENTRY_AUTH_TOKEN` - For crash reporting integration

### 3. Modify CD Workflow

Replace simulated steps with real EAS commands:

```yaml
# Replace this:
- name: 🏗️ [SIMULATED] EAS Build - iOS
  run: echo "Simulated build..."

# With this:
- name: 🏗️ EAS Build - iOS
  run: eas build --platform ios --profile production --non-interactive
  env:
    EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}
```

### 4. Update Scripts

Modify [`scripts/simulate-deployment.js`](../scripts/simulate-deployment.js) to call real APIs:

```javascript
// Replace simulation
const response = await fetch('https://api.expo.dev/v2/builds', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.EXPO_TOKEN}`,
  },
  body: JSON.stringify(buildConfig),
})
```

### 5. Configure Store Metadata

Set up store listings using Fastlane (optional but recommended):

```bash
# Initialize Fastlane
cd ios && fastlane init
cd ../android && fastlane init

# Configure app metadata
# Edit fastlane/metadata/*/
```

## 📊 Monitoring & Debugging

### View Pipeline Status

**GitHub UI:**

1. Go to repository **Actions** tab
2. Select workflow run
3. Click on jobs to see detailed logs

**Command line:**

```bash
# List recent workflow runs
gh run list

# View specific run
gh run view <run-id>

# Watch live run
gh run watch
```

### Check Coverage Reports

Coverage reports are uploaded as artifacts:

```bash
# Download coverage from latest CI run
gh run download -n coverage-report

# View locally
open coverage/lcov-report/index.html
```

### Debugging Failed Builds

**Common Issues:**

1. **TypeScript errors**

   ```bash
   # Run locally
   yarn typecheck
   ```

2. **Coverage threshold failures**

   ```bash
   # Check current coverage
   yarn test:coverage

   # View detailed report
   open coverage/lcov-report/index.html
   ```

3. **Lint errors**

   ```bash
   # Fix automatically
   yarn lint:fix
   ```

4. **Dependency issues**
   ```bash
   # Clean and reinstall
   yarn clean:caches
   ```

### Pipeline Logs

Each workflow step produces detailed logs. Look for:

- ✅ Green checkmarks = success
- ❌ Red X's = failure
- 🟡 Yellow warnings = issues but not blocking

## 🎯 Best Practices

### Branch Strategy

- `main` - Production-ready code, protected
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency production fixes

### Commit Messages

Follow Conventional Commits:

```bash
feat: add new analytics dashboard
fix: resolve crash on iOS 17
chore: update dependencies
docs: improve CI/CD documentation
test: add coverage for auth service
```

Enforced by Commitlint in pre-commit hook.

### Version Numbering

Follow Semantic Versioning (semver):

- **Major** (X.0.0) - Breaking changes
- **Minor** (0.X.0) - New features, backward compatible
- **Patch** (0.0.X) - Bug fixes, backward compatible

### Testing Strategy

- **Unit Tests** - Core business logic (70%+ coverage)
- **Integration Tests** - API and service interactions
- **E2E Tests** - Critical user flows (Maestro, run separately)

## 🔒 Security

### Secrets Management

- Never commit secrets to Git
- Use GitHub Secrets for sensitive data
- Rotate API keys regularly
- Use environment-specific configurations

### Code Scanning

- SonarCloud runs on every PR
- Checks for vulnerabilities, code smells, bugs
- Security hotspots highlighted
- Technical debt tracked

### Dependency Updates

- Dependabot configured for weekly scans
- Auto-creates PRs for security updates
- Review and merge regularly

## 📈 Metrics & KPIs

Track these metrics for CI/CD health:

- **Build Success Rate** - Target: >95%
- **Average Build Time** - CI: <5 min, CD: <15 min
- **Test Coverage** - Target: >75%
- **Deployment Frequency** - Weekly for production
- **Mean Time to Recovery** - Target: <1 hour
- **Change Failure Rate** - Target: <5%

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Application Services (EAS)](https://docs.expo.dev/eas/)
- [Expo Managed Workflow](https://docs.expo.dev/archive/managed-vs-bare/)
- [SonarCloud Documentation](https://sonarcloud.io/documentation)
- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Contributing

When contributing to this project:

1. Create a feature branch
2. Make your changes
3. Ensure all tests pass locally
4. Run `yarn check` before committing
5. Push and create a PR
6. Wait for CI checks to pass
7. Request review

The pre-push hook will run checks automatically. To bypass (not recommended):

```bash
git push --no-verify
```

## 📞 Support

For issues or questions:

1. Check [Troubleshooting Guide](../FUSE.wiki/Troubleshooting.md)
2. Review GitHub Actions logs
3. Search existing issues
4. Create new issue with template

---

**Last Updated:** March 2026  
**Maintainer:** Eugenio Silva  
**Status:** ✅ Active - Simulated for Portfolio

> 💡 **Note:** This CI/CD implementation demonstrates professional DevOps practices in a portfolio context. The deployment simulations showcase what a production pipeline would look like, without requiring actual app store accounts or credentials.
