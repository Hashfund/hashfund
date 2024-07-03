use solana_program::{account_info::AccountInfo, program_error::ProgramError};

pub mod hash_token_account;
pub mod hash_token_account_v2;
pub mod initialize_curve_account;
pub mod initialize_mint_account;
pub mod mint_to_account;
pub mod swap_account;

pub trait Account<'a> {
    
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError>
    where
        Self: Sized;
}
