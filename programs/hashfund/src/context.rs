use solana_program::{account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey};
use spl_associated_token_account::get_associated_token_address;

use crate::account::Account;

#[derive(Clone, Copy)]
pub struct Context<'a, T, U: Account<'a>> {
    pub program_id: &'a Pubkey,
    pub payload: T,
    pub accounts: U,
}

impl<'a, T, U: Account<'a>> Context<'a, T, U> {
    pub fn new(
        program_id: &'a Pubkey,
        account_infos: &'a [AccountInfo<'a>],
        payload: T,
    ) -> Result<Self, ProgramError> {
        Ok(Self {
            program_id,
            accounts: U::new(account_infos)?,
            payload,
        })
    }

    pub fn find_authority_id(&self, owner: &Pubkey, mint: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[b"mint_authority", owner.as_ref(), mint.as_ref()],
            &self.program_id,
        )
    }

    pub fn find_bounding_curve(&self, mint: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"hashfund", mint.as_ref()], &self.program_id)
    }

    pub fn find_bounding_curve_reserve(&self, bounding_curve: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"hashfund", bounding_curve.as_ref()], &self.program_id)
    }

    pub fn get_bounding_curve_ata(&self, bounding_curve: &Pubkey, mint: &Pubkey) -> Pubkey {
        get_associated_token_address(&bounding_curve, mint)
    }
}
