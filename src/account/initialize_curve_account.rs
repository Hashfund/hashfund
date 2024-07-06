use solana_program::account_info::{next_account_info, AccountInfo};

use super::Account;

pub struct InitializeCurveAccount<'a> {
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_a_mint_reserve: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_reserve: AccountInfo<'a>,
    pub bounding_curve_token_a_reserve: AccountInfo<'a>,
    pub sol_usd_feed: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for InitializeCurveAccount<'a> {
    fn new(
        accounts: &'a [AccountInfo<'a>],
    ) -> Result<Self, solana_program::program_error::ProgramError> {
        let accounts = &mut accounts.iter();
        
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let token_a_mint_reserve = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let bounding_curve_reserve = next_account_info(accounts)?;
        let bounding_curve_token_a_reserve = next_account_info(accounts)?;

        let sol_usd_feed = next_account_info(accounts)?;

        let payer = next_account_info(accounts)?;

        Ok(Self {
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            token_a_mint_reserve: token_a_mint_reserve.clone(),
            bounding_curve: bounding_curve.clone(),
            bounding_curve_reserve: bounding_curve_reserve.clone(),
            bounding_curve_token_a_reserve: bounding_curve_token_a_reserve.clone(),
            sol_usd_feed: sol_usd_feed.clone(),
            payer: payer.clone(),
        })
    }
}
