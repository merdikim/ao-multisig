#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

if [ "$#" -gt 0 ]; then
    lua "$SCRIPT_DIR/bundle.lua" "$@"
    exit 0
fi

lua "$SCRIPT_DIR/bundle.lua" "$BACKEND_DIR/src/multisig/index.lua" "$BACKEND_DIR/build/multisig.lua"
lua "$SCRIPT_DIR/bundle.lua" "$BACKEND_DIR/src/multisig-indexer/index.lua" "$BACKEND_DIR/build/multisig_indexer.lua"
