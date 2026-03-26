#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-src}"
rg --glob '*.{ts,tsx}' --no-filename '^import ' "$TARGET" || true
