use anchor_lang::prelude::*;

#[error_code]
pub enum MintTokenError {
    #[msg("Liquidity percentage can't be less than 0 or greater than 100")]
    InvalidLiquidityPercentage,
    #[msg("Account not own by pyth oracle program")]
    InvalidFeedAccount,
}

#[error_code]
pub enum SwapTokenError {
    #[msg("Invalid trade direction")]
    InvalidTradeDirection,
    #[msg("Mint is not tradeable on zeroboost")]
    NotTradeable,
    #[msg("Amount must be a value greater than zero")]
    InvalidAmount,
    #[msg("Invalid mint")]
    InvalidMint,
    #[msg("Invalid pair")]
    InvalidPair,
    #[msg("Invalid user position")]
    InvalidUserPosition,
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,
    #[msg("Insufficient liquidity")]
    InsufficientLiquidity,
}

pub struct BoundingCurve {
    pub total_fees_collected: u64, // 8
    pub bump: u8, // 1
    pub reserve_bump: u8, // 1
}

#[error_code]
pub enum MigrateFundError {
    #[msg("Mint not migratable")]
    NotMigratable,
    #[msg("Mint already migrated")]
    AlreadyMigrated,
}
