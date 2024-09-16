use spl_program_error::*;

#[spl_program_error]
pub enum TokenMintError {
    #[error("Incorrect mint authority")]
    IncorrectMintAuthority,
    #[error("Incorrect token mint account")]
    IncorrectTokenMintAccount,
    #[error("Incorrect Mint Reserve Associate Token Account")]
    IncorrectMintReserveATA,
}


