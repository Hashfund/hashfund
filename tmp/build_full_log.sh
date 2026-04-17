#!/bin/bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"
cd /mnt/c/Users/rolan/projects/hashfund/packages/zeroboost
anchor build > build_full.log 2>&1
echo "Exit code: $?"
