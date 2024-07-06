use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};

use super::Account;

pub struct MintToAccount<'a> {
    pub token_program: AccountInfo<'a>,
    pub mint: AccountInfo<'a>,
    pub mint_reserve: AccountInfo<'a>,
    pub mint_authority: AccountInfo<'a>,

    pub bounding_curve: AccountInfo<'a>,

    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for MintToAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();
        let token_program = next_account_info(accounts)?;
        let mint = next_account_info(accounts)?;

        let mint_reserve = next_account_info(accounts)?;
        let mint_authority = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let payer = next_account_info(accounts)?;

        Ok(Self {
            token_program: token_program.clone(),
            mint: mint.clone(),
            mint_reserve: mint_reserve.clone(),
            mint_authority: mint_authority.clone(),
            bounding_curve: bounding_curve.clone(),
            payer: payer.clone(),
        })
    }
}
