use anchor_lang::prelude::*;

pub const BOUNDING_CURVE_SIZE: usize =
    8  + 32 + 32 + 1 + 1 + 1 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1 + 1;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum MigrationTarget {
    Raydium = 0,
}

#[account]
pub struct BoundingCurve {
    pub pair: Pubkey, // 32
    pub mint: Pubkey, // 32
    pub migrated: bool, // 1
    pub tradeable: bool, // 1
    pub liquidity_percentage: u8, // 1
    pub initial_price: u64, // 8
    pub initial_supply: u64, // 8
    pub minimum_pair_balance: u64, // 8
    pub maximum_pair_balance: u64, // 8
    pub virtual_token_balance: u64, // 8
    pub virtual_pair_balance: u64, // 8
    pub net_active_capital: u64, // 8
    pub total_contributed: u64, // 8
    pub total_burned_tokens: u64, // 8
    pub total_fees_collected: u64, // 8
    pub bump: u8, // 1
    pub reserve_bump: u8, // 1
}

impl BoundingCurve {
    pub fn add(&mut self, mint: Pubkey, amount: u64) {
        if mint.eq(&self.mint) {
            self.virtual_token_balance += amount;
        } else if mint.eq(&self.pair) {
            self.virtual_pair_balance += amount;
        }
    }

    pub fn sub(&mut self, mint: Pubkey, amount: u64) {
        if mint.eq(&self.mint) {
            self.virtual_token_balance -= amount;
        } else if mint.eq(&self.pair) {
            self.virtual_pair_balance -= amount;
        }
    }
}
