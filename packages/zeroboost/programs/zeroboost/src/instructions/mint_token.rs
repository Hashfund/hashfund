use std::ops::Mul;

use anchor_lang::{
    prelude::*,
    system_program::{transfer, Transfer, create_account, CreateAccount},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{mint_to, transfer_checked, Mint, MintTo, Token, TokenAccount, TransferChecked},
};

use curve::{
    curve::{constant_curve::ConstantCurveCalculator, CurveCalculator},
};

use crate::{
    error::MintTokenError,
    events::MintEvent,
    metadata_fee_reciever,
    states::{
        bounding_curve::{BoundingCurve, MigrationTarget, BOUNDING_CURVE_SIZE},
        config::Config,
    },
    utils::{Validate},
    CONFIG_SEED, CURVE_SEED, CURVE_RESERVE_SEED,
};

#[derive(Accounts)]
#[instruction(params: MintTokenParams)]
pub struct MintToken<'info> {
    #[account(
        init,
        seeds = [params.name.as_ref(), params.symbol.as_ref(), creator.key().as_ref()],
        bump,
        payer = creator,
        mint::decimals = params.decimals,
        mint::authority = bounding_curve,
        mint::freeze_authority = bounding_curve,
        token::token_program = token_program
    )]
    pub mint: Box<Account<'info, Mint>>,
    pub pair: Box<Account<'info, Mint>>,

    #[account(
        init,
        seeds = [mint.key().as_ref(), CURVE_SEED.as_bytes()],
        bump,
        payer = creator,
        space = BOUNDING_CURVE_SIZE
    )]
    pub bounding_curve: Box<Account<'info, BoundingCurve>>,
    
    /// CHECK: Manual Init
    pub bounding_curve_ata: UncheckedAccount<'info>,
    /// CHECK: Manual Init
    pub bounding_curve_reserve: UncheckedAccount<'info>,
    /// CHECK: Manual Init
    pub bounding_curve_reserve_ata: UncheckedAccount<'info>,
    /// CHECK: Manual Init
    pub bounding_curve_reserve_pair_ata: UncheckedAccount<'info>,

    #[account(seeds=[CONFIG_SEED.as_bytes()], bump)]
    pub config: Box<Account<'info, Config>>,
    
    /// CHECK: Metadata
    pub metadata: UncheckedAccount<'info>,
    #[account(mut, address=metadata_fee_reciever::id())]
    pub metadata_fee_reciever: UncheckedAccount<'info>,
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintTokenParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub supply: u64,
    pub decimals: u8,
    pub liquidity_percentage: u8,
    pub migration_target: MigrationTarget,
}

impl Validate for MintTokenParams {
    fn validate(&self) -> Result<()> {
        if self.liquidity_percentage > 100 {
            return err!(MintTokenError::InvalidLiquidityPercentage);
        }
        Ok(())
    }
}

impl<'info> MintToken<'info> {
    pub fn process_mint_token(mut context: Context<MintToken>, params: &MintTokenParams) -> Result<()> {
        params.validate()?;
        
        let accounts = &mut context.accounts;
        let bumps = &context.bumps;
        
        // Find reserve bump
        let (reserve_pda, reserve_bump) = Pubkey::find_program_address(
            &[accounts.bounding_curve.key().as_ref(), CURVE_RESERVE_SEED.as_bytes()],
            &crate::ID
        );
        require_keys_eq!(accounts.bounding_curve_reserve.key(), reserve_pda, MintTokenError::InvalidFeedAccount);

        // Manual Init reserve if needed
        if accounts.bounding_curve_reserve.data_is_empty() {
            let bounding_curve_key = accounts.bounding_curve.key();
            let signer_seeds = &[
                bounding_curve_key.as_ref(),
                CURVE_RESERVE_SEED.as_bytes(),
                &[reserve_bump],
            ];
            create_account(
                CpiContext::new_with_signer(
                    accounts.system_program.to_account_info(),
                    CreateAccount {
                        from: accounts.creator.to_account_info(),
                        to: accounts.bounding_curve_reserve.to_account_info(),
                    },
                    &[&signer_seeds[..]],
                ),
                accounts.rent.minimum_balance(0),
                0,
                &crate::ID,
            )?;
        }

        // Manual Init ATAs
        accounts.ensure_ata_initialized(&accounts.bounding_curve_ata, &accounts.mint.to_account_info(), &accounts.bounding_curve.to_account_info())?;
        accounts.ensure_ata_initialized(&accounts.bounding_curve_reserve_ata, &accounts.mint.to_account_info(), &accounts.bounding_curve_reserve.to_account_info())?;
        accounts.ensure_ata_initialized(&accounts.bounding_curve_reserve_pair_ata, &accounts.pair.to_account_info(), &accounts.bounding_curve_reserve.to_account_info())?;

        let mint_key = &accounts.mint.key();
        let signer_seeds = &[
            mint_key.as_ref(),
            CURVE_SEED.as_bytes(),
            &[bumps.bounding_curve],
        ];
        let signer_seeds = [&signer_seeds[..]];

        // Mint tokens to the bounding curve ATA
        mint_to(
            CpiContext::new_with_signer(
                accounts.token_program.to_account_info(),
                MintTo {
                    mint: accounts.mint.to_account_info(),
                    to: accounts.bounding_curve_ata.to_account_info(),
                    authority: accounts.bounding_curve.to_account_info(),
                },
                &signer_seeds,
            ),
            params.supply,
        )?;

        // Collect metadata creation fee
        let metadata_fee: u64 = (accounts.config.metadata_creation_fee as u64).mul(10_u64.pow(5));
        transfer(
            CpiContext::new(
                accounts.system_program.to_account_info(),
                Transfer {
                    from: accounts.creator.to_account_info(),
                    to: accounts.metadata_fee_reciever.to_account_info(),
                },
            ),
            metadata_fee,
        )?;

        // Curve calculations
        let curve = ConstantCurveCalculator::new(
            params.supply,
            params.liquidity_percentage,
        );

        let initial_price = curve.calculate_initial_price();
        let bounding_curve_supply = curve.get_bounding_curve_supply();
        let maximum_pair_balance = curve.get_token_b_reserve_balance();
        let virtual_token_balance = curve.get_virtual_token_reserve();
        let virtual_pair_balance = curve.get_token_b_reserve_balance();

        // Transfer tokens to the curve reserve account
        transfer_checked(
            CpiContext::new_with_signer(
                accounts.token_program.to_account_info(),
                TransferChecked {
                    mint: accounts.mint.to_account_info(),
                    from: accounts.bounding_curve_ata.to_account_info(),
                    to: accounts.bounding_curve_reserve_ata.to_account_info(),
                    authority: accounts.bounding_curve.to_account_info(),
                },
                &signer_seeds,
            ),
            bounding_curve_supply,
            params.decimals,
        )?;

        // Create Metadata
        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: accounts.metadata.to_account_info(),
                    mint: accounts.mint.to_account_info(),
                    mint_authority: accounts.bounding_curve.to_account_info(),
                    payer: accounts.creator.to_account_info(),
                    update_authority: accounts.bounding_curve.to_account_info(),
                    system_program: accounts.system_program.to_account_info(),
                    rent: accounts.rent.to_account_info(),
                },
                &signer_seeds,
            ),
            DataV2 {
                name: params.name.clone(),
                symbol: params.symbol.clone(),
                uri: params.uri.clone(),
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true, // Is mutable
            true, // Update authority is signer
            None, // Collection details
        )?;

        // Initialize Bounding Curve state
        accounts.bounding_curve.set_inner(BoundingCurve {
            mint: accounts.mint.key(),
            pair: accounts.pair.key(),
            migrated: false,
            tradeable: true,
            liquidity_percentage: params.liquidity_percentage,
            initial_price,
            initial_supply: bounding_curve_supply,
            minimum_pair_balance: virtual_pair_balance, // virtual pair balance is the starting liquidity
            maximum_pair_balance,
            virtual_token_balance,
            virtual_pair_balance,
            net_active_capital: 0,
            total_contributed: 0,
            total_burned_tokens: 0,
            total_fees_collected: 0,
            bump: bumps.bounding_curve,
            reserve_bump,
        });

        let clock = Clock::get()?;
        emit!(MintEvent {
            mint: accounts.mint.key(),
            name: params.name.clone(),
            symbol: params.symbol.clone(),
            uri: params.uri.clone(),
            supply: params.supply,
            decimals: accounts.mint.decimals,
            bounding_curve: accounts.bounding_curve.key(),
            creator: accounts.creator.key(),
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    fn ensure_ata_initialized(&self, ata: &AccountInfo<'info>, mint: &AccountInfo<'info>, owner: &AccountInfo<'info>) -> Result<()> {
        if ata.data_is_empty() {
             anchor_spl::associated_token::create(
                CpiContext::new(
                    self.associated_token_program.to_account_info(),
                    anchor_spl::associated_token::Create {
                        payer: self.creator.to_account_info(),
                        associated_token: ata.to_account_info(),
                        authority: owner.to_account_info(),
                        mint: mint.to_account_info(),
                        system_program: self.system_program.to_account_info(),
                        token_program: self.token_program.to_account_info(),
                    },
                ),
            )?;
        }
        Ok(())
    }
}
