#!/bin/bash
# 監聽 Web 相關檔案，變更後自動部署到 Vercel

set -e
cd "$(dirname "$0")/.."

echo "👀 監聽中… 變更後約 8 秒自動部署到 Vercel"
echo "   檔案：index.html, api/, assets/, manifest.json, vercel.json"
echo "   按 Ctrl+C 停止"
echo ""

npx --yes chokidar-cli \
  "index.html" \
  "api/**/*" \
  "assets/**/*" \
  "manifest.json" \
  "vercel.json" \
  --debounce 8000 \
  --initial \
  -c "npm run deploy"
