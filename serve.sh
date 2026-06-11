#!/bin/bash
# TenantSentry.ai site — Local Dev (macOS/Linux)
# Mac equivalent of serve.bat

cd "$(dirname "$0")"

echo "Starting TenantSentry local server..."
echo "Open http://localhost:8080 in your browser"
echo "Press Ctrl+C to stop"

python3 -m http.server 8080
