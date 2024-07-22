use solana_program::{
    account_info::{next_account_info, AccountInfo},
    program_error::ProgramError,
};


use super::Account;

pub struct InitializeMintAccount<'a> {
    pub sysvar_rent: AccountInfo<'a>,
    pub sysvar_instructions: AccountInfo<'a>,
    pub system_program: AccountInfo<'a>,
    pub token_program: AccountInfo<'a>,
    pub mint: AccountInfo<'a>,
    pub authority: AccountInfo<'a>,
    pub metadata_program: AccountInfo<'a>,
    pub metadata_pda: AccountInfo<'a>,
    pub master_edition: AccountInfo<'a>,
    pub create_mint_fee_receiver: AccountInfo<'a>,
    pub payer: AccountInfo<'a>,
}

impl<'a> Account<'a> for InitializeMintAccount<'a> {
    fn new(accounts: &'a [AccountInfo<'a>]) -> Result<Self, ProgramError> {
        let accounts = &mut accounts.iter();

        let sysvar_rent = next_account_info(accounts)?;
        let sysvar_instructions = next_account_info(accounts)?;

        let system_program = next_account_info(accounts)?;
        let token_program = next_account_info(accounts)?;
        let metadata_program = next_account_info(accounts)?;

        let mint = next_account_info(accounts)?;
        let authority = next_account_info(accounts)?;

        let metadata_pda = next_account_info(accounts)?;
        let master_edition = next_account_info(accounts)?;

        let create_mint_fee_receiver = next_account_info(accounts)?;

        let payer = next_account_info(accounts)?;

        Ok(Self {
            sysvar_rent: sysvar_rent.clone(),
            sysvar_instructions: sysvar_instructions.clone(),
            system_program: system_program.clone(),
            token_program: token_program.clone(),
            mint: mint.clone(),
            authority: authority.clone(),
            metadata_program: metadata_program.clone(),
            metadata_pda: metadata_pda.clone(),
            master_edition: master_edition.clone(),
            create_mint_fee_receiver: create_mint_fee_receiver.clone(),
            payer: payer.clone(),
        })
    }
}
