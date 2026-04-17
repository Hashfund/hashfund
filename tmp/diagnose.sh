#!/bin/bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"

cd /mnt/c/Users/rolan/projects/hashfund/packages/zeroboost

echo "=== Anchor version ==="
anchor --version

echo "=== AVM list ==="
avm list 2>/dev/null | head -20 || echo "avm list failed"

echo "=== Solana active release ==="
ls ~/.local/share/solana/install/active_release/bin/ | head -10 2>/dev/null || echo "no active release"

echo "=== agave-install? ==="
which agave-install 2>/dev/null || echo "not found"

echo "=== Anchor.toml toolchain ==="
cat /mnt/c/Users/rolan/projects/hashfund/packages/zeroboost/Anchor.toml

echo "=== Cargo.toml ==="
cat /mnt/c/Users/rolan/projects/hashfund/packages/zeroboost/Cargo.toml
