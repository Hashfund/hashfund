use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};

use super::Account;

pub struct InitializeRaydiumAccount<'a> {
    pub sysrent_var: AccountInfo<'a>,
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub associate_token_program: AccountInfo<'a>,
    pub amm_program: AccountInfo<'a>,
    pub market_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub market: AccountInfo<'a>,
    // amm account
    pub amm_pool: AccountInfo<'a>,
    pub amm_authority: AccountInfo<'a>,
    pub amm_token_a_vault: AccountInfo<'a>,
    pub amm_token_b_vault: AccountInfo<'a>,
    pub amm_target_orders: AccountInfo<'a>,
    pub amm_config: AccountInfo<'a>,
    pub amm_lp_mint: AccountInfo<'a>,
    pub amm_open_orders: AccountInfo<'a>,
    pub amm_create_fee_destination: AccountInfo<'a>,
    // bounding_curve
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_reserve: AccountInfo<'a>,
    pub bounding_curve_token_a_reserve: AccountInfo<'a>,
    pub bounding_curve_token_b_reserve: AccountInfo<'a>,
    pub bounding_curve_lp_reserve: AccountInfo<'a>,

    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for InitializeRaydiumAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let sysrent_var = next_account_info(accounts)?;
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;
        let associate_token_program = next_account_info(accounts)?;
        let amm_program = next_account_info(accounts)?;
        let market_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let lp_mint = next_account_info(accounts)?;

        let market = next_account_info(accounts)?;

        let amm_pool = next_account_info(accounts)?;
        let amm_authority = next_account_info(accounts)?;
        let amm_token_a_vault = next_account_info(accounts)?;
        let amm_token_b_vault = next_account_info(accounts)?;
        let amm_target_orders = next_account_info(accounts)?;
        let amm_config = next_account_info(accounts)?;
        let amm_open_orders = next_account_info(accounts)?;
        let amm_create_fee_destination = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let bounding_curve_reserve = next_account_info(accounts)?;
        let bounding_curve_token_a_reserve = next_account_info(accounts)?;
        let bounding_curve_token_b_reserve = next_account_info(accounts)?;
        let bounding_curve_lp_reserve = next_account_info(accounts)?;
        
        let payer = next_account_info(accounts)?;

        Ok(Self {
            sysrent_var: sysrent_var.clone(),
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            associate_token_program: associate_token_program.clone(),
            amm_program: amm_program.clone(),
            market_program: market_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            amm_lp_mint: lp_mint.clone(),
            market: market.clone(),
            amm_pool: amm_pool.clone(),
            amm_authority: amm_authority.clone(),
            amm_token_a_vault: amm_token_a_vault.clone(),
            amm_token_b_vault: amm_token_b_vault.clone(),
            amm_target_orders: amm_target_orders.clone(),
            amm_config: amm_config.clone(),
            amm_open_orders: amm_open_orders.clone(),
            amm_create_fee_destination: amm_create_fee_destination.clone(),
            bounding_curve: bounding_curve.clone(),
            bounding_curve_reserve: bounding_curve_reserve.clone(),
            bounding_curve_token_a_reserve: bounding_curve_token_a_reserve.clone(),
            bounding_curve_token_b_reserve: bounding_curve_token_b_reserve.clone(),
            bounding_curve_lp_reserve: bounding_curve_lp_reserve.clone(),
            payer: payer.clone(),
        })
    }
}
