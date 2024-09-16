use spl_program_error::*;

#[spl_program_error]
pub enum FeeAccountError {
    #[error("Invalid create mint fee receiver")]
    InvalidCreateMintFeeReceiverAccount,
    #[error("Invalid swap fee receiver")]
    InvalidSwapFeeReceiverAccount,
    #[error("Invalid hash fee receiver")]
    InvalidHashFeeReceiverAccount,
}
 