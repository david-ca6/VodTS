#!/bin/bash
set -e

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

pnpm run build

cp -r public/icons/* dist/icons/ 2>/dev/null || true