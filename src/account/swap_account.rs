use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};

use super::Account;

pub struct SwapAccount<'a> {
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub mint: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub source: AccountInfo<'a>,
    pub destination: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for SwapAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;

        let mint = next_account_info(accounts)?;
        let bounding_curve = next_account_info(accounts)?;

        let source = next_account_info(accounts)?;
        let destination = next_account_info(accounts)?;
        let payer = next_account_info(accounts)?;

        Ok(Self {
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            mint: mint.clone(),
            bounding_curve: bounding_curve.clone(),
            source: source.clone(),
            destination: destination.clone(),
            payer: payer.clone(),
        })
    }
}
