use anchor_lang::prelude::*;

pub const USER_POSITION_SIZE: usize = 8 + 32 + 32 + 8 + 8 + 8 + 8 + 8;

#[account]
pub struct UserPosition {
    pub user: Pubkey,                // 32
    pub mint: Pubkey,                // 32
    pub contributed: u64,            // 8
    pub refunded: u64,               // 8
    pub refundable_remaining: u64,   // 8
    pub allocated_tokens: u64,       // 8
    pub burned_tokens: u64,          // 8
}
