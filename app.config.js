// app.config.js — load .env at config-time and inject values into expo.extra.firebase
// Use process.cwd() to compute the .env path; this runs in Node when Metro reads
// the config so it's safe to use dotenv here for local development.
try {
  const path = require('node:path')
  require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })
} catch {
  // noop — if dotenv isn't available we fall back to existing process.env
}

const firebase = {
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID || '',
}

function expoConfig({ config }) {
  const existingExtra = config && config.extra ? config.extra : undefined
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      'expo-font',
      'expo-localization',
      'expo-secure-store',
      'expo-web-browser',
    ],
    extra: existingExtra ? { ...existingExtra, firebase } : { firebase },
  }
}

module.exports = expoConfig
