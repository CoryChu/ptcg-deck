#!/bin/bash
# 有變更才 commit + push（供 Vercel Git 自動部署）

set -e
cd "$(dirname "$0")/.."

git add \
  index.html \
  main.js \
  package.json \
  package-lock.json \
  manifest.json \
  vercel.json \
  .vercelignore \
  api \
  assets 2>/dev/null || true

if git diff --staged --quiet; then
  echo "✓ 沒有新變更，略過 push"
  exit 0
fi

MSG="update: $(date '+%Y-%m-%d %H:%M')"
git commit -m "$MSG"
git push
echo "✓ 已 push，Vercel 會自動部署（約 30 秒）"
