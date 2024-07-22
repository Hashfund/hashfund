use solana_program::{account_info::AccountInfo, program_error::ProgramError};

pub mod pda;
pub mod pyth;
pub mod serum;
pub mod  raydium;

pub fn optional_next_account_info<'a, 'b>(
    iter: &mut dyn Iterator<Item = &'a AccountInfo<'b>>,
) -> Option<Box<AccountInfo<'b>>> {
    match iter.next() {
        Some(account) => Some(Box::new(account.clone())),
        None => None,
    }
}

pub fn unwrap_optional_account_info<'a>(
    account: Option<Box<AccountInfo<'a>>>,
) -> Result<AccountInfo<'a>, ProgramError> {
    match account {
        Some(account) => Ok(*account),
        None => Err(ProgramError::NotEnoughAccountKeys),
    }
}
