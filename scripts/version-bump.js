#!/usr/bin/env node

/**
 * Version Bump Script
 *
 * Automatically increments version numbers in package.json and app.json
 * following semantic versioning (semver) principles.
 *
 * Usage:
 *   node scripts/version-bump.js [major|minor|patch]
 *
 * Examples:
 *   node scripts/version-bump.js patch  -> 1.0.0 -> 1.0.1
 *   node scripts/version-bump.js minor  -> 1.0.0 -> 1.1.0
 *   node scripts/version-bump.js major  -> 1.0.0 -> 2.0.0
 */

const fs = require('fs')
const path = require('path')

// Get bump type from command line args
const bumpType = process.argv[2] || 'patch'

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('❌ Invalid bump type. Must be one of: major, minor, patch')
  console.error('')
  console.error('Usage: node scripts/version-bump.js [major|minor|patch]')
  process.exit(1)
}

/**
 * Parse semantic version string
 */
function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`)
  }
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  }
}

/**
 * Bump version based on type
 */
function bumpVersion(version, type) {
  const newVersion = { ...version }

  switch (type) {
    case 'major':
      newVersion.major += 1
      newVersion.minor = 0
      newVersion.patch = 0
      break
    case 'minor':
      newVersion.minor += 1
      newVersion.patch = 0
      break
    case 'patch':
      newVersion.patch += 1
      break
  }

  return newVersion
}

/**
 * Format version object to string
 */
function formatVersion(version) {
  return `${version.major}.${version.minor}.${version.patch}`
}

/**
 * Update file with new version
 */
function updateFile(filePath, updateFn) {
  const content = fs.readFileSync(filePath, 'utf8')
  const json = JSON.parse(content)
  const oldVersion = json.version

  updateFn(json)

  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n')

  return { oldVersion, newVersion: json.version }
}

// Main execution
try {
  console.log('🔄 Version Bump Tool')
  console.log('══════════════════════════════════════════════')
  console.log('')

  // Paths
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  const appJsonPath = path.join(process.cwd(), 'app.json')

  // Read current version from package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const currentVersionString = packageJson.version
  const currentVersion = parseVersion(currentVersionString)

  console.log(`📦 Current version: ${currentVersionString}`)
  console.log(`🔨 Bump type: ${bumpType}`)
  console.log('')

  // Calculate new version
  const newVersion = bumpVersion(currentVersion, bumpType)
  const newVersionString = formatVersion(newVersion)

  console.log(`✨ New version: ${newVersionString}`)
  console.log('')

  // Update package.json
  console.log('📝 Updating package.json...')
  updateFile(packageJsonPath, (json) => {
    json.version = newVersionString
  })
  console.log('   ✅ package.json updated')

  // Update app.json
  if (fs.existsSync(appJsonPath)) {
    console.log('📝 Updating app.json...')
    updateFile(appJsonPath, (json) => {
      json.expo.version = newVersionString
      // Also bump iOS buildNumber and Android versionCode
      if (json.expo.ios) {
        const currentBuildNumber = json.expo.ios.buildNumber || '1'
        json.expo.ios.buildNumber = String(parseInt(currentBuildNumber) + 1)
      }
      if (json.expo.android) {
        const currentVersionCode = json.expo.android.versionCode || 1
        json.expo.android.versionCode = currentVersionCode + 1
      }
    })
    console.log('   ✅ app.json updated')
  }

  console.log('')
  console.log('══════════════════════════════════════════════')
  console.log('✅ Version bump completed successfully!')
  console.log('')
  console.log('📋 Summary:')
  console.log(`   Old: ${currentVersionString}`)
  console.log(`   New: ${newVersionString}`)
  console.log(`   Type: ${bumpType}`)
  console.log('')
  console.log('🔧 Next steps:')
  console.log('   1. Review the changes')
  console.log(
    '   2. Commit with: git commit -m "chore: bump version to ' +
      newVersionString +
      '"',
  )
  console.log('   3. Tag release: git tag v' + newVersionString)
  console.log('   4. Push: git push && git push --tags')
  console.log('')

  process.exit(0)
} catch (error) {
  console.error('❌ Error:', error.message)
  process.exit(1)
}
