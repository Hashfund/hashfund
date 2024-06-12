use solana_program::{account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey};
use spl_associated_token_account::get_associated_token_address;

use crate::account::Account;

pub struct Context<'a, T, U: Account<'a>> {
    pub program_id: &'a Pubkey,
    pub payload: Box<T>,
    pub accounts: Box<U>,
}

impl<'a, T, U: Account<'a>> Context<'a, T, U> {
    pub fn new(
        program_id: &'a Pubkey,
        account_infos: &'a [AccountInfo<'a>],
        payload: T,
    ) -> Result<Self, ProgramError> {
        let accounts = Box::new(U::new(account_infos)?);
        Ok(Self {
            program_id,
            accounts,
            payload: Box::new(payload),
        })
    }

    pub fn find_authority_id(&self, owner: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(
            &[b"mint_authority", owner.to_bytes().as_ref()],
            &self.program_id,
        )
    }

    pub fn find_bounding_curve(&self, mint: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"hashfund", mint.to_bytes().as_ref()], &self.program_id)
    }

    pub fn get_bounding_curve_ata(&self, bounding_curve: &Pubkey, mint: &Pubkey) -> Pubkey {
        get_associated_token_address(&bounding_curve, mint)
    }
}
