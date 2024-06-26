use spl_program_error::*;

#[spl_program_error]
pub enum InitializeSerumMarketError {
    #[error("Invalid market account")]
    InvalidMarketAccount,
    #[error("Invalid bids account")]
    InvalidBidsAccount,
    #[error("Invalid asks account")]
    InvalidAsksAccount,
    #[error("Invalid request_queue account")]
    InvalidRequestQueueAccount,
    #[error("Invalid event_queue account")]
    InvalidEventQueueAccount,
    #[error("Invalid coin_vault account")]
    InvalidCoinVaultAccount,
    #[error("Invalid pc_vault account")]
    InvalidPcVaultAccount,
}
