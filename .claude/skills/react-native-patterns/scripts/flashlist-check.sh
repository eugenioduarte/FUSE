#!/usr/bin/env bash
set -euo pipefail

TARGET="${1:-src}"
rg -n "ScrollView" "$TARGET" || true
