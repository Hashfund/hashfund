#!/bin/bash
# Hashfund WSL Build Script
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$HOME/.cargo/bin:$HOME/.avm/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.bun/bin"
export GIT_HTTP_LOW_SPEED_LIMIT=0
export GIT_HTTP_LOW_SPEED_TIME=999999
export CARGO_NET_GIT_FETCH_WITH_CLI=true

echo "Using Solana version: $(solana --version)"
echo "Using Anchor version: $(anchor --version)"

cd packages/zeroboost
anchor build > build.log 2>&1
echo "Build exited with code $?"
tail -n 50 build.log
