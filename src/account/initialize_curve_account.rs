use solana_program::account_info::{next_account_info, AccountInfo};

use super::Account;

pub struct InitializeCurveAccount<'a> {
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_a_mint_authority: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_ata: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
    pub sol_usd_feed: AccountInfo<'a>,
}

impl<'a> Account<'a> for InitializeCurveAccount<'a> {
    fn new(
        accounts: &'a [AccountInfo<'a>],
    ) -> Result<Self, solana_program::program_error::ProgramError> {
        let accounts = &mut accounts.iter();
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_a_mint_authority = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let bounding_curve = next_account_info(accounts)?; 
        let bounding_curve_ata = next_account_info(accounts)?;

        let payer = next_account_info(accounts)?;
        let sol_usd_feed = next_account_info(accounts)?;


        Ok(Self {
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_a_mint_authority: token_a_mint_authority.clone(),
            token_b_mint: token_b_mint.clone(),
            bounding_curve: bounding_curve.clone(),
            bounding_curve_ata: bounding_curve_ata.clone(),
            payer: payer.clone(),
            sol_usd_feed: sol_usd_feed.clone(),
        })
    }
}
