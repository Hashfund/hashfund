use mpl_token_metadata::{
    instructions::CreateV1Builder,
    types::{PrintSupply, TokenStandard},
};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction::create_account,
    sysvar::Sysvar,
};
use spl_associated_token_account::get_associated_token_address;
use spl_token::{
    instruction::{initialize_mint, mint_to},
    state::Mint,
};

use crate::{
    error::{self, TokenMintError},
    state::payload::{CreatePayload, MintPayload},
};

pub fn initialize_mint_token(
    program_id: &Pubkey,
    account_infos: &[AccountInfo],
    payload: &CreatePayload,
) -> ProgramResult {
    msg!("begin processor");
    let accounts = &mut account_infos.iter();

    let sysvar_rent = next_account_info(accounts)?;
    let sysvar_instructions = next_account_info(accounts)?;

    let system_program = next_account_info(accounts)?;
    let token_program = next_account_info(accounts)?;

    let payer = next_account_info(accounts)?;
    let token_mint = next_account_info(accounts)?;
    let mint_authority = next_account_info(accounts)?;

    let metadata_program = next_account_info(accounts)?;
    let metadata_pda = next_account_info(accounts)?;
    let master_edition = next_account_info(accounts)?;
    msg!("account gotten");

    let seeds = &[
        payload.name.as_bytes().as_ref(),
        payload.ticker.as_bytes().as_ref(),
        payload.uri.as_bytes().as_ref(),
        payer.key.as_ref(),
    ];

    let (token_mint_pda, token_mint_bump) = Pubkey::find_program_address(seeds, program_id);
    let (mint_authority_pda, mint_authority_bump) =
        Pubkey::find_program_address(&[b"mint_authority", payer.key.as_ref()], program_id);

    if token_mint_pda != token_mint.key.clone() {
        msg!(
            "incorrect token mint account expected={}, got={}",
            token_mint_pda.to_string(),
            token_mint.key.to_string()
        );
        return Err(TokenMintError::IncorrectTokenMintAccount.into());
    }

    if mint_authority_pda != mint_authority.key.clone() {
        msg!(
            "incorrect mint authority expected={}, got={}",
            mint_authority_pda.to_string(),
            mint_authority.key.to_string()
        );
        return Err(TokenMintError::IncorrectMintAuthority.into());
    }

    let rent = Rent::from_account_info(sysvar_rent)?;
    let rent_lamports = rent.minimum_balance(Mint::LEN);

    let token_mint_signer_seeds: &[&[u8]] = &[
        payload.name.as_bytes().as_ref(),
        payload.ticker.as_bytes().as_ref(),
        payload.uri.as_bytes().as_ref(),
        payer.key.as_ref(),
        &[token_mint_bump],
    ];

    let mint_authority_signer_seeds: &[&[u8]] = &[
        b"mint_authority",
        payer.key.as_ref(),
        &[mint_authority_bump],
    ];

    let signers_seeds: &[&[&[u8]]] = &[token_mint_signer_seeds, mint_authority_signer_seeds];

    msg!("creating mint account...");
    // Create the mint account
    invoke_signed(
        &create_account(
            payer.key,
            token_mint.key,
            rent_lamports,
            Mint::LEN.try_into().unwrap(),
            token_program.key,
        ),
        &[payer.clone(), token_mint.clone(), system_program.clone()],
        &signers_seeds,
    )?;

    msg!("creating mint initialize...");
    // Initialize the mint account
    invoke_signed(
        &initialize_mint(
            &token_program.key,
            token_mint.key,
            &mint_authority.key,
            None,
            payload.decimals,
        )?,
        &[
            token_mint.clone(),
            sysvar_rent.clone(),
            mint_authority.clone(),
        ],
        signers_seeds,
    )?;
    msg!("initialized token mint={}", token_mint_pda.to_string());

    // Create metadata
    msg!("creating metadata...");
    let create_metadata_ix = CreateV1Builder::new()
        .metadata(metadata_pda.key.clone())
        .master_edition(Some(master_edition.key.clone()))
        .mint(token_mint.key.clone(), true)
        .authority(mint_authority.key.clone())
        .payer(payer.key.clone())
        .update_authority(mint_authority.key.clone(), false)
        .is_mutable(true)
        .primary_sale_happened(false)
        .name(payload.name.clone())
        .uri(payload.uri.clone())
        .seller_fee_basis_points(0)
        .token_standard(TokenStandard::FungibleAsset)
        .print_supply(PrintSupply::Zero)
        .spl_token_program(Some(token_program.key.clone()))
        .system_program(system_program.key.clone())
        .sysvar_instructions(sysvar_instructions.key.clone())
        .instruction();

    invoke_signed(
        &create_metadata_ix,
        &[
            metadata_program.clone(),
            master_edition.clone(),
            metadata_pda.clone(),
            token_mint.clone(),
            mint_authority.clone(), // mint authority
            payer.clone(),          // payer
            mint_authority.clone(), // update authority
            system_program.clone(),
            sysvar_instructions.clone(),
            sysvar_rent.clone(),
        ],
        &signers_seeds,
    )?;

    Ok(())
}

pub fn mint_token_to(
    program_id: &Pubkey,
    account_infos: &[AccountInfo],
    payload: &MintPayload,
) -> ProgramResult {
    let accounts = &mut account_infos.iter();

    let token_program = next_account_info(accounts)?;
    let token_mint = next_account_info(accounts)?;

    let mint_reserve = next_account_info(accounts)?;
    let mint_authority = next_account_info(accounts)?;

    let payer = next_account_info(accounts)?;

    msg!("get token account");

    let (mint_authority_pda, mint_authority_bump) = Pubkey::find_program_address(
        &["mint_authority".as_bytes().as_ref(), payer.key.as_ref()],
        program_id,
    );

    let mint_reserve_ata = get_associated_token_address(&program_id, token_mint.key);

    if mint_reserve_ata != mint_reserve.key.clone() {
        msg!(
            "Invalid mint reserve ata expected={}, got={}",
            mint_reserve_ata.to_string(),
            mint_reserve.key.to_string()
        );
        return Err(error::TokenMintError::IncorrectMintReserveATA.into());
    }

    if mint_authority_pda != mint_authority.key.clone() {
        msg!(
            "Invalid mint authority expected={}, got{}",
            mint_authority_pda.to_string(),
            mint_authority.key.to_string()
        );
        return Err(error::TokenMintError::IncorrectMintAuthority.into());
    }

    msg!("mint to instruction");

    invoke_signed(
        &mint_to(
            &token_program.key,
            &token_mint.key,
            &mint_reserve.key,
            mint_authority.key,
            &[],
            payload.amount,
        )?,
        &[
            token_mint.clone(),
            mint_reserve.clone(),
            mint_authority.clone(),
        ],
        &[&[
            "mint_authority".as_bytes().as_ref(),
            payer.key.as_ref(),
            &[mint_authority_bump],
        ]],
    )?;

    Ok(())
}
