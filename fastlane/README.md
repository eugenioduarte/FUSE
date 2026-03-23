# Fastlane README - FUSE

## 🚀 Overview

This directory contains Fastlane configuration for automating iOS and Android builds and deployments.

**⚠️ Important:** This is a **simulated setup** for portfolio demonstration. The lanes echo commands and simulate deployment processes without making actual API calls to App Store Connect or Google Play Console.

## 📋 Available Lanes

### iOS Lanes

#### Development

```bash
# Build development version
bundle exec fastlane ios build_development_simulated

# Deploy to TestFlight (simulated)
bundle exec fastlane ios deploy_testflight_simulated
```

#### Production

```bash
# Build production version
bundle exec fastlane ios build_production_simulated

# Submit to App Store (simulated)
bundle exec fastlane ios deploy_appstore_simulated

# Generate and upload screenshots (simulated)
bundle exec fastlane ios screenshots_simulated
```

### Android Lanes

#### Development

```bash
# Build development APK
bundle exec fastlane android build_development_simulated

# Deploy to internal testing (simulated)
bundle exec fastlane android deploy_internal_simulated
```

#### Production

```bash
# Build production AAB
bundle exec fastlane android build_production_simulated

# Deploy to production (simulated)
bundle exec fastlane android deploy_production_simulated

# Run tests (simulated)
bundle exec fastlane android test_simulated
```

### Cross-Platform Lanes

```bash
# Deploy both platforms - development
bundle exec fastlane deploy_all_development_simulated

# Deploy both platforms - production
bundle exec fastlane deploy_all_production_simulated

# Clean build artifacts
bundle exec fastlane clean
```

## 🔧 Setup

### Prerequisites

1. **Ruby** - Fastlane runs on Ruby

   ```bash
   ruby --version
   # Should be 2.5 or higher
   ```

2. **Bundler** - Ruby dependency manager

   ```bash
   gem install bundler
   ```

3. **Install Fastlane**

   ```bash
   # Create Gemfile if not exists
   bundle init

   # Add to Gemfile:
   # gem "fastlane"

   # Install
   bundle install
   ```

### Configuration

The configuration files are:

- **Fastfile** - Lane definitions and automation scripts
- **Appfile** - App identifiers and credentials
- **Gemfile** - Ruby dependencies (create if needed)

## 🎯 Integration with GitHub Actions

Fastlane can be integrated into the CI/CD pipeline:

```yaml
# In .github/workflows/cd-simulated.yml
- name: Run Fastlane iOS Build
  run: bundle exec fastlane ios build_production_simulated

- name: Run Fastlane Android Build
  run: bundle exec fastlane android build_production_simulated
```

## 🔄 Converting to Real Deployment

To use real (non-simulated) deployment:

### iOS Real Setup

1. **Install Xcode Command Line Tools**

   ```bash
   xcode-select --install
   ```

2. **Configure Match (Certificate Management)**

   ```bash
   bundle exec fastlane match init
   ```

3. **Update Fastfile** - Replace simulated lanes:

   ```ruby
   lane :build_production do
     gym(
       scheme: "Fuse",
       export_method: "app-store",
       output_directory: "./build"
     )
   end

   lane :deploy_appstore do
     deliver(
       skip_metadata: false,
       skip_screenshots: false,
       submit_for_review: true
     )
   end
   ```

4. **Set Environment Variables**
   ```bash
   export FASTLANE_APPLE_ID="your@email.com"
   export FASTLANE_PASSWORD="app-specific-password"
   export FASTLANE_TEAM_ID="YOUR_TEAM_ID"
   ```

### Android Real Setup

1. **Create Service Account**
   - Go to Google Play Console
   - Setup > API Access
   - Create new service account
   - Download JSON key

2. **Configure Gradle Signing**
   - Generate release keystore
   - Configure `android/app/build.gradle`
   - Store keystore securely

3. **Update Fastfile** - Replace simulated lanes:

   ```ruby
   lane :build_production do
     gradle(
       task: "bundle",
       build_type: "Release"
     )
   end

   lane :deploy_production do
     supply(
       track: "production",
       json_key: ENV["GOOGLE_PLAY_JSON_KEY"],
       aab: "android/app/build/outputs/bundle/release/app-release.aab"
     )
   end
   ```

4. **Set Environment Variables**
   ```bash
   export GOOGLE_PLAY_JSON_KEY="path/to/key.json"
   ```

## 📝 Gemfile Example

Create `fastlane/Gemfile`:

```ruby
source "https://rubygems.org"

gem "fastlane", "~> 2.220.0"

# iOS specific
gem "cocoapods", "~> 1.15.0"

# Android specific
# gem "bundler", "~> 2.5.0"

# Plugins (optional)
# gem "fastlane-plugin-firebase_app_distribution"
# gem "fastlane-plugin-badge"
```

Then run:

```bash
cd fastlane
bundle install
```

## 🔐 Security Best Practices

1. **Never commit credentials**

   ```bash
   # Add to .gitignore
   fastlane/report.xml
   fastlane/Preview.html
   fastlane/screenshots
   fastlane/test_output
   fastlane/.env*
   *.mobileprovision
   *.p12
   *.cer
   ```

2. **Use environment variables**
   - Create `.env` file (add to .gitignore)
   - Use in Fastfile: `ENV['VARIABLE_NAME']`

3. **CI/CD Secrets**
   - Store in GitHub Secrets
   - Inject during workflow execution

4. **Certificate Management**
   - Use Fastlane Match for iOS certificates
   - Store in private encrypted Git repository
   - Or use Apple's certificate management API

## 🐛 Troubleshooting

### Common Issues

**"Command not found: fastlane"**

```bash
# Install via bundler
bundle exec fastlane ...

# Or install globally
gem install fastlane
```

**"Could not find Xcode"**

```bash
# Check Xcode installation
xcode-select -p

# Reset if needed
sudo xcode-select --reset
```

**"Gradle task failed"**

```bash
# Clean Android build
cd android
./gradlew clean
cd ..
```

## 📚 Resources

- [Fastlane Documentation](https://docs.fastlane.tools/)
- [Fastlane iOS Setup](https://docs.fastlane.tools/getting-started/ios/setup/)
- [Fastlane Android Setup](https://docs.fastlane.tools/getting-started/android/setup/)
- [Fastlane Match](https://docs.fastlane.tools/actions/match/)
- [Available Actions](https://docs.fastlane.tools/actions/)

## 💡 Tips

1. **Test locally first** - Always test lanes locally before CI/CD
2. **Use versioning** - Keep Fastlane version pinned in Gemfile
3. **Modular lanes** - Break complex lanes into smaller ones
4. **Error handling** - Use error blocks for notifications
5. **Documentation** - Comment complex lane logic
6. **Dry runs** - Test with `--dry_run` flag when available

## 🎓 Learning Path

1. Start with simulated lanes (current setup)
2. Study Fastfile syntax and Ruby basics
3. Set up real iOS build locally
4. Set up real Android build locally
5. Integrate with CI/CD
6. Add advanced features (screenshots, metadata, etc.)

---

**Status:** ✅ Simulated Setup for Portfolio  
**Next Step:** Convert to real deployment when ready  
**Maintainer:** Eugenio Silva
