#!/bin/bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"

echo "=== Agave/Solana installed version ==="
solana --version

echo "=== AVM installed versions ==="
avm list --installed 2>/dev/null || avm list 2>/dev/null | grep -i installed || echo "(check above list)"

echo "=== AVM current ==="
avm use --help 2>/dev/null | head -5

echo "=== anchor 0.29.0 available? ==="
avm list 2>/dev/null | grep "0.29"

echo "=== active anchor from PATH ==="
anchor --version
which anchor
