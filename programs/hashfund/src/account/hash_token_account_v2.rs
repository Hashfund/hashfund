use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use spl_associated_token_account::get_associated_token_address_with_program_id;

use crate::{
    errors::initialize_curve_error::InitializeCurveError, utils::pda::find_bounding_curve,
};

use super::Account;

pub struct HashTokenAccountV2<'a> {
    pub sysvar_rent: AccountInfo<'a>,
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub associate_token_program: AccountInfo<'a>,
    pub amm_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub amm_lp_mint: AccountInfo<'a>,
    pub amm_pool: AccountInfo<'a>,
    pub amm_authority: AccountInfo<'a>,
    pub amm_token_a_vault: AccountInfo<'a>,
    pub amm_token_b_vault: AccountInfo<'a>,
    pub amm_config: AccountInfo<'a>,
    pub amm_observation_state: AccountInfo<'a>,
    pub amm_create_fee_destination: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_reserve: AccountInfo<'a>,
    pub bounding_curve_token_a_reserve: AccountInfo<'a>,
    pub bounding_curve_token_b_reserve: AccountInfo<'a>,
    pub bounding_curve_lp_reserve: AccountInfo<'a>,
    pub hash_token_fee_receiver: AccountInfo<'a>,
    pub payer: Option<AccountInfo<'a>>,
}

impl<'a> Account<'a> for HashTokenAccountV2<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let sysvar_rent = next_account_info(accounts)?;
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;
        let associate_token_program = next_account_info(accounts)?;
        let amm_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;

        let amm_lp_mint = next_account_info(accounts)?;
        let amm_pool = next_account_info(accounts)?;
        let amm_authority = next_account_info(accounts)?;
        let amm_token_a_vault = next_account_info(accounts)?;
        let amm_token_b_vault = next_account_info(accounts)?;
        let amm_config = next_account_info(accounts)?;
        let amm_observation_state = next_account_info(accounts)?;
        let amm_create_fee_destination = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let bounding_curve_reserve = next_account_info(accounts)?;
        let bounding_curve_token_a_reserve = next_account_info(accounts)?;
        let bounding_curve_token_b_reserve = next_account_info(accounts)?;
        let bounding_curve_lp_reserve = next_account_info(accounts)?;

        let hash_token_fee_receiver = next_account_info(accounts)?;

        let payer = match next_account_info(accounts) {
            Ok(account) => Some(account.clone()),
            Err(_) => None,
        };

        Ok(Self {
            sysvar_rent: sysvar_rent.clone(),
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            associate_token_program: associate_token_program.clone(),
            amm_program: amm_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            amm_pool: amm_pool.clone(),
            amm_authority: amm_authority.clone(),
            amm_token_a_vault: amm_token_a_vault.clone(),
            amm_token_b_vault: amm_token_b_vault.clone(),
            amm_config: amm_config.clone(),
            amm_observation_state: amm_observation_state.clone(),
            amm_lp_mint: amm_lp_mint.clone(),
            amm_create_fee_destination: amm_create_fee_destination.clone(),
            bounding_curve: bounding_curve.clone(),
            bounding_curve_reserve: bounding_curve_reserve.clone(),
            bounding_curve_token_a_reserve: bounding_curve_token_a_reserve.clone(),
            bounding_curve_token_b_reserve: bounding_curve_token_b_reserve.clone(),
            bounding_curve_lp_reserve: bounding_curve_lp_reserve.clone(),
            hash_token_fee_receiver: hash_token_fee_receiver.clone(),
            payer,
        })
    }
}

impl<'a> HashTokenAccountV2<'a> {
    pub fn check_accounts(&self, program_id: &Pubkey) -> ProgramResult {
        let bounding_curve_pda = find_bounding_curve(&self.token_b_mint.key, program_id).0;
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
            msg!(
                "1. {}, {}",
                bounding_curve_pda.to_string(),
                self.bounding_curve.key.clone()
            );
            return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
        }

        if bounding_curve_reserve_pda != self.bounding_curve_reserve.key.clone() {
            msg!(
                "2. {}, {}",
                bounding_curve_reserve_pda.to_string(),
                self.bounding_curve_reserve.key.clone()
            );

            return Err(InitializeCurveError::IncorrectBoundingCurveReserveAccount.into());
        }

        if bounding_curve_token_a_reserve_ata != self.bounding_curve_token_a_reserve.key.clone() {
            msg!(
                "3. {}, {}",
                bounding_curve_token_a_reserve_ata.to_string(),
                self.bounding_curve_token_a_reserve.key.clone()
            );

            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        if bounding_curve_token_b_reserve_ata != self.bounding_curve_token_b_reserve.key.clone() {
            msg!(
                "4. {}, {}",
                bounding_curve_token_b_reserve_ata.to_string(),
                self.bounding_curve_token_b_reserve.key.clone()
            );

            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        if bounding_curve_token_lp_reserve_ata != self.bounding_curve_lp_reserve.key.clone() {
            msg!(
                "5. {}, {}",
                bounding_curve_token_lp_reserve_ata.to_string(),
                self.bounding_curve_lp_reserve.key.clone()
            );

            return Err(InitializeCurveError::IncorrectBoundingCurveReserveATAAccount.into());
        }

        Ok(())
    }

    pub fn with_default(
        sysvar_rent: AccountInfo<'a>,
        system_program: AccountInfo<'a>,
        token_program: AccountInfo<'a>,
        associate_token_program: AccountInfo<'a>,
        bounding_curve: AccountInfo<'a>,
        bounding_curve_reserve: AccountInfo<'a>,
        accounts: &'a [AccountInfo<'a>],
    ) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let amm_program = next_account_info(accounts)?;
        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let amm_lp_mint = next_account_info(accounts)?;
        let amm_pool = next_account_info(accounts)?;
        let amm_authority = next_account_info(accounts)?;
        let amm_token_a_vault = next_account_info(accounts)?;
        let amm_token_b_vault = next_account_info(accounts)?;
        let amm_config = next_account_info(accounts)?;
        let amm_observation_state = next_account_info(accounts)?;
        let amm_create_fee_destination = next_account_info(accounts)?;
        let bounding_curve_token_a_reserve = next_account_info(accounts)?;
        let bounding_curve_token_b_reserve = next_account_info(accounts)?;
        let bounding_curve_lp_reserve = next_account_info(accounts)?;

        let hash_fee_reciever = next_account_info(accounts)?;

        Ok(HashTokenAccountV2 {
            sysvar_rent,
            system_program,
            token_program,
            associate_token_program,
            bounding_curve,
            bounding_curve_reserve,
            amm_program: amm_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            amm_lp_mint: amm_lp_mint.clone(),
            amm_pool: amm_pool.clone(),
            amm_authority: amm_authority.clone(),
            amm_token_a_vault: amm_token_a_vault.clone(),
            amm_token_b_vault: amm_token_b_vault.clone(),
            amm_config: amm_config.clone(),
            amm_observation_state: amm_observation_state.clone(),
            amm_create_fee_destination: amm_create_fee_destination.clone(),
            bounding_curve_token_a_reserve: bounding_curve_token_a_reserve.clone(),
            bounding_curve_token_b_reserve: bounding_curve_token_b_reserve.clone(),
            bounding_curve_lp_reserve: bounding_curve_lp_reserve.clone(),
            hash_token_fee_receiver: hash_fee_reciever.clone(),
            payer: None,
        })
    }
}
