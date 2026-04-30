#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ROOT_DIR="$(cd "$BACKEND_DIR/.." && pwd)"
FRONTEND_WALLET_DIR="$ROOT_DIR/frontend/wallet"

if [ "$#" -gt 0 ]; then
    lua "$SCRIPT_DIR/bundle.lua" "$@"
    exit 0
fi

lua "$SCRIPT_DIR/bundle.lua" "$BACKEND_DIR/src/multisig/index.lua" "$BACKEND_DIR/build/multisig.lua"
lua "$SCRIPT_DIR/bundle.lua" "$BACKEND_DIR/src/multisig-indexer/index.lua" "$BACKEND_DIR/build/multisig_indexer.lua"

mkdir -p "$FRONTEND_WALLET_DIR"
cp -R "$BACKEND_DIR/build/." "$FRONTEND_WALLET_DIR/"
