use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
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
