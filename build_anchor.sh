#!/bin/bash
export PATH="$HOME/.bun/bin:$HOME/.local/share/solana/install/active_release/bin:$HOME/.avm/bin:$HOME/.cargo/bin:$PATH"
cd packages/zeroboost
anchor build > build_output.log 2>&1
anchor run compile >> build_output.log 2>&1
