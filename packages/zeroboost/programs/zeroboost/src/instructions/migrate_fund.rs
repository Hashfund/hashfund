use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer_checked, Mint, Token, TokenAccount, TransferChecked},
};
use std::ops::{Div, Mul};

use crate::{
    events::MigrateEvent,
    states::{
        bounding_curve::{BoundingCurve},
        config::Config,
    },
    CURVE_RESERVE_SEED, CURVE_SEED,
};

#[derive(Accounts)]
pub struct MigrateFund<'info> {
    #[account(seeds=[crate::CONFIG_SEED.as_bytes()], bump)]
    pub config: Box<Account<'info, Config>>,
    pub mint: Box<Account<'info, Mint>>,
    pub pair: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [mint.key().as_ref(), CURVE_SEED.as_bytes()],
        bump = bounding_curve.bump
    )]
    pub bounding_curve: Box<Account<'info, BoundingCurve>>,
    #[account(mut)]
    pub bounding_curve_ata: Box<Account<'info, TokenAccount>>,
    /// CHECK: Manual validation
    pub bounding_curve_reserve: UncheckedAccount<'info>,
    #[account(mut)]
    pub bounding_curve_reserve_ata: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub bounding_curve_reserve_pair_ata: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub bounding_curve_reserve_lp_ata: Box<Account<'info, TokenAccount>>,

    /// Raydium CP-Swap Accounts (Unchecked to save stack)
    /// CHECK: 
    pub amm_config: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_authority: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_fee_receiver: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_pool_state: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_lp_mint: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_mint_vault: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_pair_vault: UncheckedAccount<'info>,
    /// CHECK: 
    pub amm_observable_state: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub payer_pair_ata: Box<Account<'info, TokenAccount>>,

    /// Programs and Sysvars
    /// CHECK:
    pub amm_program: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MigrateFundParams {
    pub open_time: Option<u64>,
}

impl<'info> MigrateFund<'info> {
    pub fn process_migrate_fund(mut context: Context<MigrateFund>, params: &MigrateFundParams) -> Result<()> {
        let accounts = &mut context.accounts;

        if accounts.bounding_curve.tradeable {
            return err!(crate::error::MigrateFundError::NotMigratable);
        }

        if accounts.bounding_curve.migrated {
            return err!(crate::error::MigrateFundError::AlreadyMigrated);
        }

        let bounding_curve_key = accounts.bounding_curve.key();
        let signer_seeds = &[
            bounding_curve_key.as_ref(),
            CURVE_RESERVE_SEED.as_bytes(),
            &[accounts.bounding_curve.reserve_bump],
        ];
        let signer_seeds_reserve = &[&signer_seeds[..]];

        // Transfer pool creation fee to reserve
        transfer(
            CpiContext::new(
                accounts.system_program.to_account_info(),
                Transfer {
                    from: accounts.payer.to_account_info(),
                    to: accounts.bounding_curve_reserve.to_account_info(),
                },
            ),
            accounts.config.estimated_raydium_cp_pool_creation_fee,
        )?;

        let init_amount = accounts.bounding_curve_ata.amount;
        let pair_init_amount = accounts.bounding_curve_reserve_pair_ata.amount;

        let admin_fee = accounts.bounding_curve.net_active_capital.mul(5).div(100);
        let pair_init_amount_after_fee = pair_init_amount - admin_fee;

        accounts.bounding_curve.total_fees_collected += admin_fee;

        transfer_checked(
            CpiContext::new_with_signer(
                accounts.token_program.to_account_info(),
                TransferChecked {
                    mint: accounts.pair.to_account_info(),
                    to: accounts.payer_pair_ata.to_account_info(),
                    from: accounts.bounding_curve_reserve_pair_ata.to_account_info(),
                    authority: accounts.bounding_curve_reserve.to_account_info(),
                },
                signer_seeds_reserve,
            ),
            admin_fee,
            accounts.pair.decimals,
        )?;
        
        let mint_key = accounts.mint.key();
        let signer_seeds_curve = &[
            mint_key.as_ref(),
            CURVE_SEED.as_bytes(),
            &[accounts.bounding_curve.bump],
        ];
        let signer_seeds_curve = &[&signer_seeds_curve[..]];

        transfer_checked(
            CpiContext::new_with_signer(
                accounts.token_program.to_account_info(),
                TransferChecked {
                    mint: accounts.mint.to_account_info(),
                    to: accounts.bounding_curve_reserve_ata.to_account_info(),
                    from: accounts.bounding_curve_ata.to_account_info(),
                    authority: accounts.bounding_curve.to_account_info(),
                },
                signer_seeds_curve,
            ),
            init_amount,
            accounts.mint.decimals,
        )?;

        // MANUAL CPI to Raydium to avoid Anchor stack bloat
        let mut data = vec![];
        // Anchor discriminator for "initialize"
        data.extend_from_slice(&[175, 175, 212, 234, 134, 31, 201, 147]); 
        data.extend_from_slice(&pair_init_amount_after_fee.to_le_bytes());
        data.extend_from_slice(&init_amount.to_le_bytes());
        data.extend_from_slice(&params.open_time.unwrap_or(0).to_le_bytes());

        let accounts_meta = vec![
            AccountMeta::new_readonly(accounts.pair.key(), false),
            AccountMeta::new_readonly(accounts.mint.key(), false),
            AccountMeta::new(accounts.bounding_curve_reserve.key(), true),
            AccountMeta::new_readonly(accounts.amm_config.key(), false),
            AccountMeta::new_readonly(accounts.amm_authority.key(), false),
            AccountMeta::new(accounts.amm_pool_state.key(), false),
            AccountMeta::new(accounts.amm_lp_mint.key(), false),
            AccountMeta::new(accounts.bounding_curve_reserve_pair_ata.key(), false),
            AccountMeta::new(accounts.bounding_curve_reserve_ata.key(), false),
            AccountMeta::new(accounts.bounding_curve_reserve_lp_ata.key(), false),
            AccountMeta::new(accounts.amm_pair_vault.key(), false),
            AccountMeta::new(accounts.amm_mint_vault.key(), false),
            AccountMeta::new_readonly(accounts.token_program.key(), false),
            AccountMeta::new_readonly(accounts.token_program.key(), false),
            AccountMeta::new_readonly(accounts.token_program.key(), false),
            AccountMeta::new_readonly(accounts.associated_token_program.key(), false),
            AccountMeta::new_readonly(accounts.system_program.key(), false),
            AccountMeta::new_readonly(accounts.rent.key(), false),
            AccountMeta::new(accounts.amm_observable_state.key(), false),
            AccountMeta::new(accounts.amm_fee_receiver.key(), false),
        ];

        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: accounts.amm_program.key(),
            accounts: accounts_meta,
            data,
        };

        anchor_lang::solana_program::program::invoke_signed(
            &ix,
            &[
                accounts.pair.to_account_info(),
                accounts.mint.to_account_info(),
                accounts.bounding_curve_reserve.to_account_info(),
                accounts.amm_config.to_account_info(),
                accounts.amm_authority.to_account_info(),
                accounts.amm_pool_state.to_account_info(),
                accounts.amm_lp_mint.to_account_info(),
                accounts.bounding_curve_reserve_pair_ata.to_account_info(),
                accounts.bounding_curve_reserve_ata.to_account_info(),
                accounts.bounding_curve_reserve_lp_ata.to_account_info(),
                accounts.amm_pair_vault.to_account_info(),
                accounts.amm_mint_vault.to_account_info(),
                accounts.token_program.to_account_info(),
                accounts.associated_token_program.to_account_info(),
                accounts.system_program.to_account_info(),
                accounts.rent.to_account_info(),
                accounts.amm_observable_state.to_account_info(),
                accounts.amm_fee_receiver.to_account_info(),
            ],
            signer_seeds_reserve,
        )?;

        // Burn LP tokens logic (simplified manual parse if needed, but keeping for now)
        let lp_amount = accounts.bounding_curve_reserve_lp_ata.amount;
        anchor_spl::token::burn(
            CpiContext::new_with_signer(
                accounts.token_program.to_account_info(),
                anchor_spl::token::Burn {
                    mint: accounts.amm_lp_mint.to_account_info(),
                    from: accounts.bounding_curve_reserve_lp_ata.to_account_info(),
                    authority: accounts.bounding_curve_reserve.to_account_info(),
                },
                signer_seeds_reserve,
            ),
            lp_amount,
        )?;
        
        accounts.bounding_curve.migrated = true;

        let clock = Clock::get()?;
        emit!(MigrateEvent {
            mint: accounts.mint.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }
}
