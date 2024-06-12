use {
    solana_program::{
        decode_error::DecodeError,
        msg,
        program_error::{PrintProgramError, ProgramError},
    },
    spl_program_error::num_derive::FromPrimitive,
    thiserror::Error,
};

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
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

impl From<TokenMintError> for ProgramError {
    fn from(e: TokenMintError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
impl<T> DecodeError<T> for TokenMintError {
    fn type_of() -> &'static str {
        "TokenMintError"
    }
}

impl PrintProgramError for TokenMintError {
    fn print<E>(&self)
    where
        E: 'static
            + std::error::Error
            + solana_program::decode_error::DecodeError<E>
            + PrintProgramError
            + num_traits::FromPrimitive,
    {
        match self {
            TokenMintError::IncorrectMintAuthority => msg!("incorrect mint authority"),
            TokenMintError::IncorrectTokenMintAccount => msg!("incorrect mint account"),
            TokenMintError::IncorrectMintReserveATA => msg!("incorrect mint reserve account"),
            TokenMintError::IncorrectBoundingCurveAccount => {
                msg!("incorrect bounding curve account")
            }
            TokenMintError::NotTradable => {
                msg!("token is not tradable. Bounding curve might have been reached")
            }
            TokenMintError::InvalidTradeDirection => msg!("invalid trade direction"),
            TokenMintError::InsufficientTokenInReserve => msg!("insufficient token in reserve"),
        }
    }
}
