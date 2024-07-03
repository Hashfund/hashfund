use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
};

use crate::{
    account::{hash_token_account_v2::HashTokenAccountV2, swap_account::SwapAccount},
    context::Context,
    state::payload::HashTokenPayloadV2,
};

const OPEN_MARKET_TIME: u8 = 0;

pub fn hash_token_v2(
    program_id: Pubkey,
    sysvar_rent: Pubkey,
    system_program: Pubkey,
    token_program: Pubkey,
    associate_token_program: Pubkey,
    amm_program: Pubkey,
    token_a_mint: Pubkey,
    token_b_mint: Pubkey,
    amm_lp_mint: Pubkey,
    amm_pool: Pubkey,
    amm_authority: Pubkey,
    amm_token_a_vault: Pubkey,
    amm_token_b_vault: Pubkey,
    amm_config: Pubkey,
    amm_observation_state: Pubkey,
    amm_create_fee_destination: Pubkey,
    bounding_curve: Pubkey,
    bounding_curve_reserve: Pubkey,
    bounding_curve_token_a_reserve: Pubkey,
    bounding_curve_token_b_reserve: Pubkey,
    bounding_curve_lp_reserve: Pubkey,
    payer: Pubkey,
) -> Instruction {
    return Instruction {
        accounts: vec![
            AccountMeta::new_readonly(sysvar_rent, false),
            AccountMeta::new_readonly(system_program, false),
            AccountMeta::new_readonly(token_program, false),
            AccountMeta::new_readonly(associate_token_program, false),
            AccountMeta::new_readonly(amm_program, false),
            AccountMeta::new_readonly(token_a_mint, false),
            AccountMeta::new_readonly(token_b_mint, false),
            AccountMeta::new(amm_lp_mint, false),
            AccountMeta::new(amm_pool, false),
            AccountMeta::new(amm_authority, false),
            AccountMeta::new(amm_token_a_vault, false),
            AccountMeta::new(amm_token_b_vault, false),
            AccountMeta::new(amm_config, false),
            AccountMeta::new(amm_observation_state, false),
            AccountMeta::new(amm_create_fee_destination, false),
            AccountMeta::new(bounding_curve, false),
            AccountMeta::new(bounding_curve_reserve, true),
            AccountMeta::new(bounding_curve_token_a_reserve, false),
            AccountMeta::new(bounding_curve_token_b_reserve, false),
            AccountMeta::new(bounding_curve_lp_reserve, false),
            AccountMeta::new_readonly(payer, false),
        ],
        data: vec![5, OPEN_MARKET_TIME],
        program_id,
    };
}

pub fn context_from_swap<'a>(
    program_id: &'a Pubkey,
    swap_account: SwapAccount<'a>,
) -> Context<'a, HashTokenPayloadV2, HashTokenAccountV2<'a>> {
    Context {
        program_id,
        payload: HashTokenPayloadV2 {
            open_time: OPEN_MARKET_TIME.into(),
        },
        accounts: HashTokenAccountV2 {
            sysvar_rent: swap_account.sysvar_rent.clone(),
            system_program: swap_account.system_program.clone(),
            token_program: swap_account.token_program.clone(),
            associate_token_program: swap_account.associate_token_program.clone(),
            amm_program: swap_account.amm_program.clone(),
            token_a_mint: swap_account.amm_token_a_mint.clone(),
            token_b_mint: swap_account.amm_token_b_mint.clone(),
            amm_lp_mint: swap_account.amm_lp_mint.clone(),
            amm_pool: swap_account.amm_pool.clone(),
            amm_authority: swap_account.amm_authority.clone(),
            amm_token_a_vault: swap_account.amm_token_a_vault.clone(),
            amm_token_b_vault: swap_account.amm_token_b_vault.clone(),
            amm_config: swap_account.amm_config.clone(),
            amm_observation_state: swap_account.amm_observation_state.clone(),
            amm_create_fee_destination: swap_account.amm_create_fee_destination.clone(),
            bounding_curve: swap_account.bounding_curve.clone(),
            bounding_curve_reserve: swap_account.bounding_curve_reserve.clone(),
            bounding_curve_token_a_reserve: swap_account.bounding_curve_token_a_reserve.clone(),
            bounding_curve_token_b_reserve: swap_account.bounding_curve_token_b_reserve.clone(),
            bounding_curve_lp_reserve: swap_account.bounding_curve_lp_reserve.clone(),
            payer: None,
        },
    }
}
