#!/bin/bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/rolan/projects/hashfund/packages/zeroboost

echo "=== Starting Anchor build ==="
anchor build 2>&1 | tail -60
echo "=== Exit code: $? ==="
