use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};

use super::Account;

pub struct SwapAccount<'a> {
    pub sysvar_rent: AccountInfo<'a>,
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub associate_token_program: AccountInfo<'a>,
    pub token_a_mint: AccountInfo<'a>,
    pub token_b_mint: AccountInfo<'a>,
    pub token_a_source: AccountInfo<'a>,
    pub token_b_source: AccountInfo<'a>,
    pub token_a_destination: AccountInfo<'a>,
    pub token_b_destination: AccountInfo<'a>,
    pub bounding_curve: AccountInfo<'a>,
    pub bounding_curve_reserve: AccountInfo<'a>,
    pub swap_fee_receiver: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for SwapAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let sysvar_rent = next_account_info(accounts)?;
        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;
        let associate_token_program = next_account_info(accounts)?;

        let token_a_mint = next_account_info(accounts)?;
        let token_b_mint = next_account_info(accounts)?;
        let token_a_source = next_account_info(accounts)?;
        let token_b_source = next_account_info(accounts)?;

        let token_a_destination = next_account_info(accounts)?;
        let token_b_destination = next_account_info(accounts)?;

        let bounding_curve = next_account_info(accounts)?;
        let bounding_curve_reserve = next_account_info(accounts)?;

        let swap_fee_receiver = next_account_info(accounts)?;

        let payer = next_account_info(accounts)?;

        Ok(Self {
            sysvar_rent: sysvar_rent.clone(),
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            associate_token_program: associate_token_program.clone(),
            token_a_mint: token_a_mint.clone(),
            token_b_mint: token_b_mint.clone(),
            token_a_source: token_a_source.clone(),
            token_a_destination: token_a_destination.clone(),
            token_b_source: token_b_source.clone(),
            token_b_destination: token_b_destination.clone(),
            bounding_curve: bounding_curve.clone(),
            bounding_curve_reserve: bounding_curve_reserve.clone(),
            swap_fee_receiver: swap_fee_receiver.clone(),
            payer: payer.clone(),
        })
    }
}
