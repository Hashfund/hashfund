use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_associated_token_account::get_associated_token_address_with_program_id;

use crate::{
    errors::initialize_curve_error::InitializeCurveError, utils::pda::find_bounding_curve,
};

use super::Account;

pub struct HashTokenAccount<'a> {
    pub sysvar_rent: AccountInfo<'a>,
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub associate_token_program: AccountInfo<'a>,
    pub serum_program: AccountInfo<'a>,
    pub amm_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub serum_token_a_vault: AccountInfo<'a>,
    pub serum_token_b_vault: AccountInfo<'a>,
    pub market: AccountInfo<'a>,
    pub bids: AccountInfo<'a>,
    pub asks: AccountInfo<'a>,
    pub req_q: AccountInfo<'a>,
    pub event_q: AccountInfo<'a>,
    pub amm_lp_mint: AccountInfo<'a>,
    pub amm_pool: AccountInfo<'a>,
    pub amm_authority: AccountInfo<'a>,
    pub amm_token_a_vault: AccountInfo<'a>,
    pub amm_token_b_vault: AccountInfo<'a>,
    pub amm_target_orders: AccountInfo<'a>,
    pub amm_config: AccountInfo<'a>,
    pub amm_open_orders: AccountInfo<'a>,
    pub amm_create_fee_destination: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_reserve: AccountInfo<'a>,
    pub bounding_curve_token_a_reserve: AccountInfo<'a>,
    pub bounding_curve_token_b_reserve: AccountInfo<'a>,
    pub bounding_curve_lp_reserve: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for HashTokenAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let sysvar_rent = next_account_info(accounts)?;
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;
        let associate_token_program = next_account_info(accounts)?;
        let serum_program = next_account_info(accounts)?;
        let amm_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;

        let serum_token_a_vault = next_account_info(accounts)?;
        let serum_token_b_vault = next_account_info(accounts)?;
        let market = next_account_info(accounts)?;
        let bids = next_account_info(accounts)?;
        let asks = next_account_info(accounts)?;
        let req_q = next_account_info(accounts)?;
        let event_q = next_account_info(accounts)?;

        let amm_lp_mint = next_account_info(accounts)?;
        let amm_pool = next_account_info(accounts)?;
        let amm_authority = next_account_info(accounts)?;
        let amm_token_a_vault = next_account_info(accounts)?;
        let amm_token_b_vault = next_account_info(accounts)?;
        let amm_token_target_orders = next_account_info(accounts)?;
        let amm_config = next_account_info(accounts)?;
        let amm_open_order = next_account_info(accounts)?;
        let amm_create_fee_destination = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let bounding_curve_reserve = next_account_info(accounts)?;
        let bounding_curve_token_a_reserve = next_account_info(accounts)?;
        let bounding_curve_token_b_reserve = next_account_info(accounts)?;
        let bounding_curve_lp_reserve = next_account_info(accounts)?;

        let payer = next_account_info(accounts)?;

        Ok(Self {
            sysvar_rent: sysvar_rent.clone(),
            system_program: system_program.clone(),
            serum_program: serum_program.clone(),
            token_program: token_program.clone(),
            associate_token_program: associate_token_program.clone(),
            amm_program: amm_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            serum_token_a_vault: serum_token_a_vault.clone(),
            serum_token_b_vault: serum_token_b_vault.clone(),
            market: market.clone(),
            bids: bids.clone(),
            asks: asks.clone(),
            req_q: req_q.clone(),
            event_q: event_q.clone(),
            amm_pool: amm_pool.clone(),
            amm_authority: amm_authority.clone(),
            amm_token_a_vault: amm_token_a_vault.clone(),
            amm_token_b_vault: amm_token_b_vault.clone(),
            amm_target_orders: amm_token_target_orders.clone(),
            amm_config: amm_config.clone(),
            amm_lp_mint: amm_lp_mint.clone(),
            amm_open_orders: amm_open_order.clone(),
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

impl<'a> HashTokenAccount<'a> {
    pub fn check_accounts(&self, program_id: &Pubkey) -> ProgramResult {
        let bounding_curve_pda = find_bounding_curve(&self.token_a_mint.key, program_id).0;
        let bounding_curve_reserve_pda =
            find_bounding_curve(&self.bounding_curve.key, program_id).0;
        let bounding_curve_token_a_reserve_ata = get_associated_token_address_with_program_id(
            &bounding_curve_reserve_pda,
            &self.token_a_mint.key,
            &self.token_program.key,
        );
        let bounding_curve_token_b_reserve_ata = get_associated_token_address_with_program_id(
            &bounding_curve_reserve_pda,
            &self.token_b_mint.key,
            &self.token_program.key,
        );
        let bounding_curve_token_lp_reserve_ata = get_associated_token_address_with_program_id(
            &bounding_curve_reserve_pda,
            &self.amm_lp_mint.key,
            &self.token_program.key,
        );

        if bounding_curve_pda != self.bounding_curve.key.clone() {
            return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
        }

        if bounding_curve_reserve_pda != self.bounding_curve_reserve.key.clone() {
            return Err(InitializeCurveError::IncorrectBoundingCurveReserveAccount.into());
        }

        if bounding_curve_token_a_reserve_ata != self.bounding_curve_token_a_reserve.key.clone() {
            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        if bounding_curve_token_b_reserve_ata != self.bounding_curve_token_b_reserve.key.clone() {
            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        if bounding_curve_token_lp_reserve_ata != self.bounding_curve_lp_reserve.key.clone() {
            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        Ok(())
    }
}
