use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};

use super::Account;

pub struct InitializeSerumMarketAccount<'a> {
    pub rent_sysvar: AccountInfo<'a>,
    pub serum_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub token_a_vault: AccountInfo<'a>,
    pub token_b_vault: AccountInfo<'a>,
    pub market: AccountInfo<'a>,
    pub bids: AccountInfo<'a>,
    pub asks: AccountInfo<'a>,
    pub req_q: AccountInfo<'a>,
    pub event_q: AccountInfo<'a>,
}

impl<'a> Account<'a> for InitializeSerumMarketAccount<'a> {
    fn new(accounts: &[AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let rent_sysvar = next_account_info(accounts)?;
        let serum_program = next_account_info(accounts)?;
        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let token_a_vault = next_account_info(accounts)?;
        let token_b_vault = next_account_info(accounts)?;
        let market = next_account_info(accounts)?;
        let bids = next_account_info(accounts)?;
        let asks = next_account_info(accounts)?;
        let req_q = next_account_info(accounts)?;
        let event_q = next_account_info(accounts)?;

        Ok(Self {
            rent_sysvar: rent_sysvar.clone(),
            serum_program: serum_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            token_a_vault: token_a_vault.clone(),
            token_b_vault: token_b_vault.clone(),
            market: market.clone(),
            bids: bids.clone(),
            asks: asks.clone(),
            req_q: req_q.clone(),
            event_q: event_q.clone(),
        })
    }
}
