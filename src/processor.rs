use std::ops::Deref;

use borsh::BorshSerialize;
use mpl_token_metadata::{
    instructions::CreateV1Builder,
    types::{PrintSupply, TokenStandard},
};
use solana_program::{
    borsh1::try_from_slice_unchecked, clock::Clock, entrypoint::ProgramResult,
    program::invoke_signed, program_pack::Pack, pubkey::Pubkey, rent::Rent,
    system_instruction::create_account, sysvar::Sysvar,
};
use spl_token::{
    instruction::{initialize_mint, mint_to},
    state::Mint,
};

use crate::{
    account::{
        initialize_curve_account::InitializeCurveAccount,
        initialize_mint_account::InitializeMintAccount, mint_to_account::MintToAccount,
        swap_account::SwapAccount,
    },
    context::Context,
    curve::{calculator::CurveCalculator, constant_price_curve::ConstantPriceCurve},
    error::{self, TokenMintError},
    events::{emit, Event},
    state::{
        payload::{InitializeCurvePayload, InitializeMintPayload, MintToPayload, SwapPayload},
        BoundingCurveInfo, BOUNDING_CURVE_INFO_SIZE,
    },
};

pub fn process_initialize_mint<'a>(
    context: &Context<'a, InitializeMintPayload, InitializeMintAccount<'a>>,
) -> ProgramResult {
    let Context {
        program_id,
        accounts,
        payload,
        ..
    } = context;

    let seeds = &[
        payload.name.as_bytes().as_ref(),
        payload.ticker.as_bytes().as_ref(),
        accounts.payer.key.as_ref(),
    ];

    let (token_mint_pda, token_mint_bump) = Pubkey::find_program_address(seeds, program_id);
    let (mint_authority_pda, mint_authority_bump) = context.find_authority_id(accounts.payer.key);

    if token_mint_pda != accounts.mint.key.clone() {
        return Err(TokenMintError::IncorrectTokenMintAccount.into());
    }

    if mint_authority_pda != accounts.authority.key.clone() {
        return Err(TokenMintError::IncorrectMintAuthority.into());
    }

    let rent = Rent::from_account_info(&accounts.sysvar_rent)?;
    let rent_lamports = rent.minimum_balance(Mint::LEN);

    let token_mint_signer_seeds: &[&[u8]] = &[
        payload.name.as_bytes().as_ref(),
        payload.ticker.as_bytes().as_ref(),
        accounts.payer.key.as_ref(),
        &[token_mint_bump],
    ];

    let mint_authority_signer_seeds: &[&[u8]] = &[
        b"mint_authority",
        accounts.payer.key.as_ref(),
        &[mint_authority_bump],
    ];

    let signers_seeds: &[&[&[u8]]] = &[token_mint_signer_seeds, mint_authority_signer_seeds];

    invoke_signed(
        &create_account(
            accounts.payer.key,
            accounts.mint.key,
            rent_lamports,
            Mint::LEN.try_into().unwrap(),
            accounts.token_program.key,
        ),
        &[
            accounts.payer.clone(),
            accounts.mint.clone(),
            accounts.system_program.clone(),
        ],
        &signers_seeds,
    )?;

    invoke_signed(
        &initialize_mint(
            &accounts.token_program.key,
            accounts.mint.key,
            &accounts.authority.key,
            None,
            payload.decimals,
        )?,
        &[
            accounts.mint.clone(),
            accounts.sysvar_rent.clone(),
            accounts.authority.clone(),
        ],
        signers_seeds,
    )?;

    let create_metadata_ix = CreateV1Builder::new()
        .metadata(accounts.metadata_pda.key.clone())
        .master_edition(Some(accounts.master_edition.key.clone()))
        .mint(accounts.mint.key.clone(), true)
        .authority(accounts.authority.key.clone())
        .payer(accounts.payer.key.clone())
        .update_authority(accounts.mint.key.clone(), false)
        .is_mutable(true)
        .primary_sale_happened(false)
        .name(payload.name.clone())
        .uri(payload.uri.clone())
        .seller_fee_basis_points(0)
        .token_standard(TokenStandard::FungibleAsset)
        .print_supply(PrintSupply::Zero)
        .spl_token_program(Some(accounts.token_program.key.clone()))
        .system_program(accounts.system_program.key.clone())
        .sysvar_instructions(accounts.sysvar_instructions.key.clone())
        .instruction();

    invoke_signed(
        &create_metadata_ix,
        &[
            accounts.metadata_program.clone(),
            accounts.master_edition.clone(),
            accounts.metadata_pda.clone(),
            accounts.mint.clone(),
            accounts.authority.clone(), // mint authority
            accounts.payer.clone(),     // payer
            accounts.authority.clone(), // update authority
            accounts.system_program.clone(),
            accounts.sysvar_instructions.clone(),
            accounts.sysvar_rent.clone(),
        ],
        &signers_seeds,
    )?;

    let clock = Clock::get()?;

    emit(Event::Mint {
        mint: accounts.mint.key.clone(),
        timestamp: clock.unix_timestamp,
        name: payload.name.clone(),
        ticker: payload.ticker.clone(),
        uri: payload.uri.clone(),
        creator: accounts.payer.key.clone(),
    });

    Ok(())
}

pub fn process_mint_to<'a>(
    context: &Context<'a, MintToPayload, MintToAccount<'a>>,
) -> ProgramResult {
    let Context {
        accounts, payload, ..
    } = context;

    let bounding_curve = context.find_bounding_curve(accounts.mint.key).0;
    let mint_reserve_ata = context.get_bounding_curve_ata(&bounding_curve, accounts.mint.key);

    let (mint_authority_pda, mint_authority_bump) = context.find_authority_id(accounts.payer.key);

    if mint_reserve_ata != accounts.reserve.key.clone() {
        return Err(error::TokenMintError::IncorrectMintReserveATA.into());
    }

    if mint_authority_pda != accounts.authority.key.clone() {
        return Err(error::TokenMintError::IncorrectMintAuthority.into());
    }

    invoke_signed(
        &mint_to(
            &accounts.token_program.key,
            &accounts.mint.key,
            &accounts.reserve.key,
            accounts.authority.key,
            &[],
            payload.amount,
        )?,
        &[
            accounts.mint.clone(),
            accounts.reserve.clone(),
            accounts.authority.clone(),
        ],
        &[&[
            "mint_authority".as_bytes().as_ref(),
            accounts.payer.key.as_ref(),
            &[mint_authority_bump],
        ]],
    )?;

    let clock = Clock::get()?;

    emit(Event::MintTo {
        amount: payload.amount,
        timestamp: clock.unix_timestamp,
        mint: accounts.mint.key.clone(),
        reserve: accounts.reserve.key.clone(),
    });

    Ok(())
}

pub fn process_initialize_curve<'a>(
    context: &Context<'a, InitializeCurvePayload, InitializeCurveAccount<'a>>,
) -> ProgramResult {
    let Context {
        program_id,
        payload,
        accounts,
    } = context;

    let (bounding_curve_pda, bounding_curve_bump) =
        context.find_bounding_curve(&accounts.token_a_mint.key);

    if bounding_curve_pda != accounts.bounding_curve.key.clone() {
        return Err(error::TokenMintError::IncorrectBoundingCurveAccount.into());
    }

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(BOUNDING_CURVE_INFO_SIZE);

    let token_a_mint = Mint::unpack(&accounts.token_a_mint.data.borrow())?;
    let token_b_mint = Mint::unpack(&accounts.token_b_mint.data.borrow())?;

    let token_a_denominator = 10u128.pow(token_a_mint.decimals.into());
    let token_b_denominator = 10u128.pow(token_b_mint.decimals.into());

    let curve = ConstantPriceCurve::new(
        token_a_mint.supply.into(),
        payload.initial_buy_amount.into(),
        token_a_denominator,
        token_b_denominator,
    );

    let initial_price: u64 = curve.calculate_initial_price().try_into().unwrap();

    invoke_signed(
        &create_account(
            accounts.payer.key,
            &bounding_curve_pda,
            rent_lamports,
            BOUNDING_CURVE_INFO_SIZE.try_into().unwrap(),
            program_id,
        ),
        &[accounts.payer.clone(), accounts.bounding_curve.clone()],
        &[&[
            b"hashfund",
            accounts.token_a_mint.key.to_bytes().as_ref(),
            &[bounding_curve_bump],
        ]],
    )?;

    let mut bounding_curve_state =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;
    bounding_curve_state.can_trade = true;
    bounding_curve_state.initial_price = initial_price;
    bounding_curve_state.maximum_market_cap = payload.maximum_market_cap;
    bounding_curve_state.mint = accounts.token_a_mint.key.clone();
    bounding_curve_state.serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

    let clock = Clock::get()?;

    emit(Event::InitializeCurve {
        initial_price,
        maximum_market_cap: payload.maximum_market_cap,
        timestamp: clock.unix_timestamp,
        mint: accounts.token_a_mint.key.clone(),
        bounding_curve: accounts.bounding_curve.key.clone(),
    });

    Ok(())
}

pub fn process_swap<'a>(context: &Context<'a, SwapPayload, SwapAccount<'a>>) -> ProgramResult {
    let Context {
        payload, accounts, ..
    } = context;

    let bounding_curve_bump = context.find_bounding_curve(&accounts.token_a_mint.key).1;

    let mut bounding_curve_info =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;

    if bounding_curve_info.mint != accounts.token_a_mint.key.clone() {
        return Err(error::TokenMintError::IncorrectBoundingCurveAccount.into());
    }

    if !bounding_curve_info.can_trade {
        return Err(error::TokenMintError::NotTradable.into());
    }

    let signers_seeds: &[&[&[u8]]] = &[&[
        b"hashfund",
        bounding_curve_info.mint.as_ref(),
        &[bounding_curve_bump],
    ]];

    match payload.direction {
        0 => {
            bounding_curve_info = bounding_curve_info.swap_in::<ConstantPriceCurve>(
                accounts.deref(),
                payload.amount,
                signers_seeds,
            )?;

            bounding_curve_info
                .serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

            Ok(())
        }
        1 => {
            bounding_curve_info.swap_out::<ConstantPriceCurve>(
                &accounts.deref(),
                payload.amount,
                signers_seeds,
            )?;

            Ok(())
        }
        _ => Err(error::TokenMintError::InvalidTradeDirection.into()),
    }
}
