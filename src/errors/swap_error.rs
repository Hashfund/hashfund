use spl_program_error::*;

#[spl_program_error]
pub enum SwapError {
    #[error("Mint not tradable")]
    NotTradable,
    #[error("Invalid trade direction")]
    InvalidTradeDirection,
    #[error("Insufficient token in reserve")]
    InsufficientTokenInReserve,
}
