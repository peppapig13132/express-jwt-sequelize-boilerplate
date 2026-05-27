#!/usr/bin/env bash
# Regenerates package-lock.json when npm is not installed on the host (Windows-friendly via Docker).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

MSYS_NO_PATHCONV=1 docker run --rm \
  -v "${ROOT}:/app" \
  -w /app \
  node:20-bookworm \
  npm install

echo "package-lock.json updated. Commit the lock file for reproducible npm ci builds."
