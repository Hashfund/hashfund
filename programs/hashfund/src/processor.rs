use std::ops::{Add, Div, Mul, Sub};

use anchor_lang::context::CpiContext;
use borsh::BorshSerialize;
use bounding_curve::{
    curve::{calculator::CurveCalculator, constant_curve::ConstantCurve},
    safe_number::Math,
};
use mpl_token_metadata::{
    instructions::CreateV1Builder,
    types::{PrintSupply, TokenStandard},
};
use pyth_sdk_solana::state::SolanaPriceAccount;
use solana_program::{
    borsh1::try_from_slice_unchecked,
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction::{create_account, transfer},
    sysvar::Sysvar,
};
use spl_token::{
    instruction::{burn, initialize_mint, mint_to, sync_native},
    state::{Account, Mint},
};

use crate::{
    account::{
        hash_token_account::HashTokenAccount, hash_token_account_v2::HashTokenAccountV2,
        initialize_curve_account::InitializeCurveAccount,
        initialize_mint_account::InitializeMintAccount, mint_to_account::MintToAccount,
        swap_account::SwapAccount,
    },
    context::Context,
    create_mint_fee_receiver,
    errors::{
        fee_account_error::FeeAccountError, hash_token_error::HashTokenError,
        initialize_curve_error::InitializeCurveError, swap_error::SwapError,
        token_mint_error::TokenMintError,
    },
    events::{self, emit, Event},
    hash_token_fee_receiver,
    state::{
        payload::{
            HashTokenPayload, HashTokenPayloadV2, InitializeCurvePayload, InitializeMintPayload,
            MintToPayload, SwapPayload,
        },
        BoundingCurveInfo, BOUNDING_CURVE_INFO_SIZE,
    },
    utils::{pyth::price_to_number, raydium::get_estimated_creation_fee},
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

    let (mint_authority_pda, mint_authority_bump) =
        context.find_authority_id(&accounts.payer.key, &token_mint_pda);

    if create_mint_fee_receiver::ID != accounts.create_mint_fee_receiver.key.clone() {
        return Err(FeeAccountError::InvalidCreateMintFeeReceiverAccount.into());
    }

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
        accounts.mint.key.as_ref(),
        &[mint_authority_bump],
    ];

    let signers_seeds: &[&[&[u8]]] = &[token_mint_signer_seeds, mint_authority_signer_seeds];

    invoke(
        &transfer(
            &accounts.payer.key,
            &create_mint_fee_receiver::ID,
            5_u64.mul(10_u64.pow(5)),
        ),
        &[
            accounts.payer.clone(),
            accounts.create_mint_fee_receiver.clone(),
        ],
    )?;

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

    let bounding_curve_pda = context.find_bounding_curve(accounts.mint.key).0;
    let mint_reserve_ata = context.get_bounding_curve_ata(&bounding_curve_pda, accounts.mint.key);

    let (mint_authority_pda, mint_authority_bump) =
        context.find_authority_id(&accounts.payer.key, &accounts.mint.key);

    if mint_authority_pda != accounts.mint_authority.key.clone() {
        return Err(TokenMintError::IncorrectMintAuthority.into());
    }

    if bounding_curve_pda != accounts.bounding_curve.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
    }

    if mint_reserve_ata != accounts.mint_reserve.key.clone() {
        return Err(TokenMintError::IncorrectMintReserveATA.into());
    }

    invoke_signed(
        &mint_to(
            &accounts.token_program.key,
            &accounts.mint.key,
            &accounts.mint_reserve.key,
            accounts.mint_authority.key,
            &[],
            payload.amount,
        )?,
        &[
            accounts.mint.clone(),
            accounts.mint_reserve.clone(),
            accounts.mint_authority.clone(),
        ],
        &[&[
            b"mint_authority",
            accounts.payer.key.as_ref(),
            accounts.mint.key.as_ref(),
            &[mint_authority_bump],
        ]],
    )?;

    let clock = Clock::get()?;

    emit(Event::MintTo {
        amount: payload.amount,
        timestamp: clock.unix_timestamp,
        mint: accounts.mint.key.clone(),
        reserve: accounts.mint_reserve.key.clone(),
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
    } = &context;

    let (bounding_curve_pda, bounding_curve_bump) =
        context.find_bounding_curve(&accounts.token_a_mint.key);
    let (bounding_curve_reserve_pda, bounding_curve_reserve_bump) =
        context.find_bounding_curve_reserve(&bounding_curve_pda);

    let mint_reserve_pda =
        context.get_bounding_curve_ata(&bounding_curve_pda, &accounts.token_a_mint.key);

    if bounding_curve_pda != accounts.bounding_curve.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
    }

    if bounding_curve_reserve_pda != accounts.bounding_curve_reserve.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveReserveAccount.into());
    }

    if mint_reserve_pda != accounts.token_a_mint_reserve.key.clone() {
        return Err(TokenMintError::IncorrectMintReserveATA.into());
    }

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(BOUNDING_CURVE_INFO_SIZE);

    let token_a_mint = Mint::unpack(&accounts.token_a_mint.data.borrow())?;

    let curve_initial_supply = token_a_mint
        .supply
        .mul(payload.supply_fraction as u64)
        .div(100)
        .into();

    invoke_signed(
        &spl_token::instruction::transfer(
            &accounts.token_program.key,
            &accounts.token_a_mint_reserve.key,
            &accounts.bounding_curve_token_a_reserve.key,
            &accounts.bounding_curve.key,
            &[],
            curve_initial_supply,
        )?,
        &[
            accounts.token_a_mint_reserve.clone(),
            accounts.bounding_curve_token_a_reserve.clone(),
            accounts.bounding_curve.clone(),
        ],
        &[&[
            b"hashfund",
            accounts.token_a_mint.key.as_ref(),
            &[bounding_curve_bump],
        ]],
    )?;

    invoke_signed(
        &create_account(
            accounts.payer.key,
            &accounts.bounding_curve.key,
            rent_lamports,
            BOUNDING_CURVE_INFO_SIZE.try_into().unwrap(),
            program_id,
        ),
        &[accounts.payer.clone(), accounts.bounding_curve.clone()],
        &[&[
            b"hashfund",
            accounts.token_a_mint.key.as_ref(),
            &[bounding_curve_bump],
        ]],
    )?;

    let signers_seeds: &[&[&[u8]]] = &[&[
        b"hashfund",
        bounding_curve_pda.as_ref(),
        &[bounding_curve_reserve_bump],
    ]];

    invoke_signed(
        &create_account(
            &accounts.payer.key,
            &accounts.bounding_curve_reserve.key,
            rent.minimum_balance(0),
            0,
            &accounts.system_program.key,
        ),
        &[
            accounts.payer.clone(),
            accounts.bounding_curve_reserve.clone(),
        ],
        signers_seeds,
    )?;

    let feed = SolanaPriceAccount::account_info_to_feed(&accounts.sol_usd_feed)?;
    let price = price_to_number(feed.get_price_unchecked());

    let sol_to_burn = price.inverse_div(4000).mul(10_u128.pow(9));
    let sol_to_burn = sol_to_burn.unwrap::<u64>();

    let maximum_market_cap = payload.maximum_market_cap.add(get_estimated_creation_fee());

    msg!("maximum_market_cap={}", maximum_market_cap);

    let curve = ConstantCurve::new(curve_initial_supply, maximum_market_cap);

    let initial_price = curve.calculate_initial_price();

    let mut bounding_curve_state =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;

    bounding_curve_state.can_trade = true;
    bounding_curve_state.is_hashed = false;
    bounding_curve_state.curve_initial_supply = curve_initial_supply;
    bounding_curve_state.initial_market_cap = sol_to_burn;
    bounding_curve_state.initial_price = initial_price;
    bounding_curve_state.maximum_market_cap = maximum_market_cap;
    bounding_curve_state.mint = accounts.token_a_mint.key.clone();
    bounding_curve_state.serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

    let clock = Clock::get()?;

    emit(Event::InitializeCurve {
        initial_price,
        maximum_market_cap,
        curve_initial_supply,
        initial_market_cap: sol_to_burn,
        timestamp: clock.unix_timestamp,
        mint: accounts.token_a_mint.key.clone(),
        bounding_curve: accounts.bounding_curve.key.clone(),
    });

    let clock = Clock::get()?;

    emit(Event::Swap {
        amount_in: sol_to_burn,
        amount_out: 0,
        trade_direction: 2,
        market_cap: 0,
        virtual_market_cap: sol_to_burn,
        timestamp: clock.unix_timestamp,
        mint: accounts.token_a_mint.key.clone(),
        payer: accounts.bounding_curve_reserve.key.clone(),
    });

    Ok(())
}

pub fn process_swap<'a>(context: &Context<'a, SwapPayload, SwapAccount<'a>>) -> ProgramResult {
    let Context {
        payload, accounts, ..
    } = context;

    let bounding_curve_pda = context.find_bounding_curve(&accounts.token_a_mint.key).0;
    let (bounding_curve_reserve_pda, bounding_curve_reserve_bump) =
        context.find_bounding_curve_reserve(&bounding_curve_pda);

    if bounding_curve_pda != accounts.bounding_curve.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
    }

    if bounding_curve_reserve_pda != accounts.bounding_curve_reserve.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveReserveAccount.into());
    }

    let mut bounding_curve_state =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;

    if bounding_curve_state.mint != accounts.token_a_mint.key.clone() {
        return Err(InitializeCurveError::IncorrectBoundingCurveAccount.into());
    }

    if !bounding_curve_state.can_trade {
        return Err(SwapError::NotTradable.into());
    }

    msg!("amount={}\n", payload.amount);
    msg!("direction={}\n", payload.direction);

    let signers_seeds: &[&[&[u8]]] = &[&[
        b"hashfund",
        bounding_curve_pda.as_ref(),
        &[bounding_curve_reserve_bump],
    ]];

    match payload.direction {
        0 => {
            bounding_curve_state = bounding_curve_state.swap_in::<ConstantCurve>(
                &accounts,
                payload.amount,
                signers_seeds,
            )?;

            bounding_curve_state
                .serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

            Ok(())
        }
        1 => {
            bounding_curve_state.swap_out::<ConstantCurve>(
                &accounts,
                payload.amount,
                signers_seeds,
            )?;

            Ok(())
        }
        _ => Err(SwapError::InvalidTradeDirection.into()),
    }
}

pub fn process_hash_token<'a>(
    context: &Context<'a, HashTokenPayload, HashTokenAccount<'a>>,
) -> ProgramResult {
    let Context {
        program_id,
        payload,
        accounts,
    } = context;

    accounts.check_accounts(program_id)?;

    let mut bounding_curve_state =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;

    if bounding_curve_state.can_trade {
        return Err(HashTokenError::ImmatureBoundingCurve.into());
    }

    if bounding_curve_state.is_hashed {
        return Err(HashTokenError::InvalidHashBoundingCurve.into());
    }

    invoke(
        &serum_dex::instruction::initialize_market(
            &accounts.market.key,
            &accounts.serum_program.key,
            &accounts.token_a_mint.key,
            &accounts.token_b_mint.key,
            &accounts.serum_token_a_vault.key,
            &accounts.serum_token_b_vault.key,
            None,
            None,
            None,
            &accounts.bids.key,
            &accounts.asks.key,
            &accounts.req_q.key,
            &accounts.event_q.key,
            payload.coin_lot_size,
            payload.pc_lot_size,
            payload.vault_signer_nonce,
            payload.pc_dust_threshold,
        )?,
        &[
            accounts.market.clone(),
            accounts.req_q.clone(),
            accounts.event_q.clone(),
            accounts.bids.clone(),
            accounts.asks.clone(),
            accounts.serum_token_a_vault.clone(),
            accounts.serum_token_b_vault.clone(),
            accounts.token_a_mint.clone(),
            accounts.token_b_mint.clone(),
            accounts.sysvar_rent.clone(),
        ],
    )?;

    let bounding_curve_token_a_info = Account::unpack(
        &accounts
            .bounding_curve_token_a_reserve
            .data
            .try_borrow()
            .unwrap(),
    )?;

    let pc_amount = bounding_curve_state.maximum_market_cap;
    let coin_amount = bounding_curve_token_a_info.amount;

    let bounding_curve_reserve_bump = context
        .find_bounding_curve_reserve(&accounts.bounding_curve.key)
        .1;

    let signers_seeds: &[&[&[u8]]] = &[&[
        b"hashfund",
        accounts.bounding_curve.key.as_ref(),
        &[bounding_curve_reserve_bump],
    ]];

    invoke_signed(
        &transfer(
            &accounts.bounding_curve_reserve.key,
            &accounts.bounding_curve_token_b_reserve.key,
            pc_amount,
        ),
        &[
            accounts.bounding_curve_reserve.clone(),
            accounts.bounding_curve_token_b_reserve.clone(),
        ],
        signers_seeds,
    )?;

    invoke_signed(
        &sync_native(
            &accounts.token_program.key,
            &accounts.bounding_curve_token_b_reserve.key,
        )?,
        &[accounts.bounding_curve_token_b_reserve.clone()],
        signers_seeds,
    )?;

    invoke_signed(
        &raydium_amm::instruction::initialize2(
            &accounts.amm_program.key,
            accounts.amm_pool.key,
            &accounts.amm_authority.key,
            &accounts.amm_open_orders.key,
            &accounts.amm_lp_mint.key.clone(),
            &accounts.token_a_mint.key,
            &accounts.token_b_mint.key,
            &accounts.amm_token_a_vault.key,
            &accounts.amm_token_b_vault.key,
            &accounts.amm_target_orders.key,
            &accounts.amm_config.key,
            &accounts.amm_create_fee_destination.key,
            &accounts.serum_program.key,
            &accounts.market.key,
            &accounts.bounding_curve_reserve.key,
            &accounts.bounding_curve_token_a_reserve.key,
            &accounts.bounding_curve_token_b_reserve.key,
            &accounts.bounding_curve_lp_reserve.key,
            payload.nonce,
            payload.open_time,
            pc_amount,
            coin_amount,
        )?,
        &[
            accounts.token_program.clone(),
            accounts.associate_token_program.clone(),
            accounts.system_program.clone(),
            accounts.sysvar_rent.clone(),
            accounts.amm_pool.clone(),
            accounts.amm_authority.clone(),
            accounts.amm_open_orders.clone(),
            accounts.amm_lp_mint.clone(),
            accounts.token_a_mint.clone(),
            accounts.token_b_mint.clone(),
            accounts.amm_token_a_vault.clone(),
            accounts.amm_token_b_vault.clone(),
            accounts.amm_target_orders.clone(),
            accounts.amm_config.clone(),
            accounts.amm_create_fee_destination.clone(),
            accounts.serum_program.clone(),
            accounts.market.clone(),
            accounts.bounding_curve_reserve.clone(),
            accounts.bounding_curve_token_a_reserve.clone(),
            accounts.bounding_curve_token_b_reserve.clone(),
            accounts.bounding_curve_lp_reserve.clone(),
        ],
        signers_seeds,
    )?;

    let clock = Clock::get()?;

    emit(events::Event::HashToken {
        coin_amount,
        pc_amount,
        market: Some(accounts.market.key.clone()),
        amm: accounts.amm_pool.key.clone(),
        token_a_mint: accounts.token_a_mint.key.clone(),
        token_b_mint: accounts.token_b_mint.key.clone(),
        timestamp: clock.unix_timestamp,
    });

    bounding_curve_state.is_hashed = true;
    bounding_curve_state.serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

    Ok(())
}

pub fn process_hash_token_v2<'a>(
    context: &Context<'a, HashTokenPayloadV2, HashTokenAccountV2<'a>>,
) -> ProgramResult {
    let Context {
        program_id,
        payload,
        accounts,
    } = context;

    accounts.check_accounts(program_id)?;

    let bounding_curve_reserve_bump = context
        .find_bounding_curve_reserve(&accounts.bounding_curve.key)
        .1;

    let signers_seeds: &[&[&[u8]]] = &[&[
        b"hashfund",
        accounts.bounding_curve.key.as_ref(),
        &[bounding_curve_reserve_bump],
    ]];

    let mut bounding_curve_state =
        try_from_slice_unchecked::<BoundingCurveInfo>(&accounts.bounding_curve.data.borrow())?;

    if hash_token_fee_receiver::ID != accounts.hash_token_fee_receiver.key.clone() {
        return Err(FeeAccountError::InvalidHashFeeReceiverAccount.into());
    }

    if bounding_curve_state.can_trade {
        return Err(HashTokenError::ImmatureBoundingCurve.into());
    }

    if bounding_curve_state.is_hashed {
        return Err(HashTokenError::InvalidHashBoundingCurve.into());
    }

    let bounding_curve_token_b_info = Account::unpack(
        &accounts
            .bounding_curve_token_b_reserve
            .data
            .try_borrow()
            .unwrap(),
    )?;

    let init_amount_0 = accounts.bounding_curve_reserve.lamports();
    let init_amount_1 = bounding_curve_token_b_info.amount;
    let rent = Rent::get()?;

    msg!("initial_amount_0={}", init_amount_0);

    let init_amount_0 = init_amount_0.sub(payload.estimated_pool_creation_fee);

    let hash_token_fee = init_amount_0.mul(5).div(100);

    let init_amount_0 = init_amount_0
        .sub(rent.minimum_balance(0))
        .sub(hash_token_fee);

    let safe_init_amount_0 = if init_amount_0 > bounding_curve_state.maximum_market_cap {
        bounding_curve_state.maximum_market_cap
    } else {
        init_amount_0
    };

    let hash_token_fee = if init_amount_0 > bounding_curve_state.maximum_market_cap {
        hash_token_fee + init_amount_0 - bounding_curve_state.maximum_market_cap
    } else {
        hash_token_fee
    };

    invoke_signed(
        &transfer(
            &accounts.bounding_curve_reserve.key,
            &hash_token_fee_receiver::ID,
            hash_token_fee,
        ),
        &[
            accounts.bounding_curve_reserve.clone(),
            accounts.hash_token_fee_receiver.clone(),
        ],
        signers_seeds,
    )?;

    invoke_signed(
        &transfer(
            &accounts.bounding_curve_reserve.key,
            &accounts.bounding_curve_token_a_reserve.key,
            safe_init_amount_0,
        ),
        &[
            accounts.bounding_curve_reserve.clone(),
            accounts.bounding_curve_token_a_reserve.clone(),
        ],
        signers_seeds,
    )?;

    invoke_signed(
        &sync_native(
            &accounts.token_program.key,
            &accounts.bounding_curve_token_a_reserve.key,
        )?,
        &[accounts.bounding_curve_token_a_reserve.clone()],
        signers_seeds,
    )?;

    let ctx = CpiContext::new_with_signer(
        accounts.amm_program.clone(),
        raydium_cp_swap::cpi::accounts::Initialize {
            system_program: accounts.system_program.clone(),
            rent: accounts.sysvar_rent.clone(),
            token_program: accounts.token_program.clone(),
            associated_token_program: accounts.associate_token_program.clone(),
            amm_config: accounts.amm_config.clone(),
            observation_state: accounts.amm_observation_state.clone(),
            authority: accounts.amm_authority.clone(),
            pool_state: accounts.amm_pool.clone(),
            token_0_mint: accounts.token_a_mint.clone(),
            token_1_mint: accounts.token_b_mint.clone(),
            lp_mint: accounts.amm_lp_mint.clone(),
            creator: accounts.bounding_curve_reserve.clone(),
            creator_token_0: accounts.bounding_curve_token_a_reserve.clone(),
            creator_token_1: accounts.bounding_curve_token_b_reserve.clone(),
            creator_lp_token: accounts.bounding_curve_lp_reserve.clone(),
            token_0_program: accounts.token_program.clone(),
            token_1_program: accounts.token_program.clone(),
            token_0_vault: accounts.amm_token_a_vault.clone(),
            token_1_vault: accounts.amm_token_b_vault.clone(),
            create_pool_fee: accounts.amm_create_fee_destination.clone(),
        },
        signers_seeds,
    );

    raydium_cp_swap::cpi::initialize(ctx, init_amount_0, init_amount_1, payload.open_time)?;

    let lp_amount = Account::unpack(
        &accounts
            .bounding_curve_lp_reserve
            .data
            .try_borrow()
            .unwrap(),
    )?;

    invoke_signed(
        &burn(
            &accounts.token_program.key,
            &accounts.bounding_curve_lp_reserve.key,
            &accounts.amm_lp_mint.key,
            &accounts.bounding_curve_reserve.key,
            &[],
            lp_amount.amount,
        )?,
        &[
            accounts.bounding_curve_lp_reserve.clone(),
            accounts.amm_lp_mint.clone(),
            accounts.bounding_curve_reserve.clone(),
        ],
        signers_seeds,
    )?;

    let clock = Clock::get()?;

    emit(events::Event::HashToken {
        coin_amount: init_amount_0,
        pc_amount: init_amount_1,
        market: None,
        amm: accounts.amm_pool.key.clone(),
        token_a_mint: accounts.token_a_mint.key.clone(),
        token_b_mint: accounts.token_b_mint.key.clone(),
        timestamp: clock.unix_timestamp,
    });

    emit(events::Event::Swap {
        mint: accounts.token_b_mint.key.clone(),
        amount_in: 0,
        amount_out: init_amount_1,
        trade_direction: 2,
        virtual_market_cap: bounding_curve_state
            .initial_market_cap
            .add(accounts.bounding_curve_reserve.lamports()),
        market_cap: accounts.bounding_curve_reserve.lamports(),
        timestamp: clock.unix_timestamp,
        payer: accounts.bounding_curve_reserve.key.clone(),
    });

    bounding_curve_state.is_hashed = true;
    bounding_curve_state.serialize(&mut &mut accounts.bounding_curve.data.borrow_mut()[..])?;

    Ok(())
}
