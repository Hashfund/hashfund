use spl_program_error::*;

#[spl_program_error]
pub enum TokenMintError {
    #[error("Incorrect mint authority")]
    IncorrectMintAuthority,
    #[error("Incorrect token mint account")]
    IncorrectTokenMintAccount,
    #[error("Incorrect Mint Reserve Associate Token Account")]
    IncorrectMintReserveATA,
    #[error("Invalid bounding curve account")]
    IncorrectBoundingCurveAccount,
    #[error("Mint not tradable")]
    NotTradable,
    #[error("Invalid trade direction")]
    InvalidTradeDirection,
    #[error("Insufficient token mint reserve")]
    InsufficientTokenInReserve,
}
