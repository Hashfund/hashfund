use anchor_lang::{ prelude::*, system_program::{ self, transfer } };
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{
        sync_native,
        transfer_checked,
        Mint,
        SyncNative,
        Token,
        TokenAccount,
        TransferChecked,
        Burn,
        burn,
    },
};
use curve::{
    curve::{ constant_curve::ConstantCurveCalculator, CurveCalculator, TradeDirection },
};

use crate::{
    error::SwapTokenError,
    events::{ SwapEvent, MigrateTriggerEvent },
    states::{ bounding_curve::BoundingCurve, config::Config, user_position::{UserPosition, USER_POSITION_SIZE} },
    utils::Validate,
    CONFIG_SEED,
    CURVE_RESERVE_SEED,
    CURVE_SEED,
};

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub bounding_curve: Box<Account<'info, BoundingCurve>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: Manual validation & init
    pub user_position: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub bounding_curve_reserve: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub bounding_curve_reserve_ata: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub bounding_curve_reserve_pair_ata: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub payer_ata: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub payer_pair_ata: UncheckedAccount<'info>,
    /// CHECK: Manual validation
    pub fee_receiver_pair_ata: UncheckedAccount<'info>,
    #[account(address = crate::migration_fee_receiver::id())]
    /// CHECK: Fee receiver
    pub fee_receiver: UncheckedAccount<'info>,
    pub mint: Box<Account<'info, Mint>>,
    pub pair: Box<Account<'info, Mint>>,
    #[account(seeds = [CONFIG_SEED.as_bytes()], bump = config.bump)]
    pub config: Box<Account<'info, Config>>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug)]
pub struct SwapParams {
    pub amount: u64,
    pub trade_direction: u8,
}

impl Validate for SwapParams {
    fn validate(&self) -> Result<()> {
        if self.amount <= 0 {
            return err!(SwapTokenError::InvalidAmount);
        }
        Ok(())
    }
}

impl<'info> Swap<'info> {
    pub fn process_swap(mut context: Context<Swap>, params: &SwapParams) -> Result<()> {
        params.validate()?;

        let accounts = &mut context.accounts;
        
        if !accounts.bounding_curve.tradeable {
            return err!(SwapTokenError::NotTradeable);
        }

        // Manual validation of addresses
        require_keys_eq!(accounts.mint.key(), accounts.bounding_curve.mint, SwapTokenError::InvalidMint);
        require_keys_eq!(accounts.pair.key(), accounts.bounding_curve.pair, SwapTokenError::InvalidPair);

        let trade_direction = (match params.trade_direction {
            0 => Ok(TradeDirection::AtoB),
            1 => Ok(TradeDirection::BtoA),
            _ => err!(SwapTokenError::InvalidTradeDirection),
        })?;

        let (token_amount, pair_amount) = (match trade_direction {
            TradeDirection::AtoB =>
                accounts.process_sell(&params),
            TradeDirection::BtoA =>
                accounts.process_buy(&params),
        })?;

        let clock = Clock::get()?;

        emit!(SwapEvent {
            token_amount,
            pair_amount,
            mint: accounts.mint.key(),
            payer: accounts.payer.key(),
            trade_direction: params.trade_direction,
            virtual_token_balance: accounts.bounding_curve.virtual_token_balance,
            virtual_pair_balance: accounts.bounding_curve.virtual_pair_balance,
            market_cap: 0, 
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
                        payer: self.payer.to_account_info(),
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

    fn ensure_user_position_initialized(&self) -> Result<()> {
        if self.user_position.data_is_empty() {
            let mint_key = self.mint.key();
            let payer_key = self.payer.key();
            let seeds = &[
                b"user_position",
                payer_key.as_ref(),
                mint_key.as_ref(),
            ];
            let (pda, bump) = Pubkey::find_program_address(seeds, &crate::ID);
            require_keys_eq!(self.user_position.key(), pda, SwapTokenError::InvalidUserPosition);

            let signer_seeds = &[
                b"user_position",
                payer_key.as_ref(),
                mint_key.as_ref(),
                &[bump],
            ];

            let lamports = self.rent.minimum_balance(USER_POSITION_SIZE);
            system_program::create_account(
                CpiContext::new_with_signer(
                    self.system_program.to_account_info(),
                    system_program::CreateAccount {
                        from: self.payer.to_account_info(),
                        to: self.user_position.to_account_info(),
                    },
                    &[signer_seeds],
                ),
                lamports,
                USER_POSITION_SIZE as u64,
                &crate::ID,
            )?;
        }
        Ok(())
    }

    #[inline(never)]
    fn process_buy(&mut self, params: &SwapParams) -> Result<(u64, u64)> {
        // Validation & Init ATAs
        self.ensure_ata_initialized(&self.payer_ata, &self.mint.to_account_info(), &self.payer.to_account_info())?;
        self.ensure_ata_initialized(&self.bounding_curve_reserve_ata, &self.mint.to_account_info(), &self.bounding_curve_reserve.to_account_info())?;
        self.ensure_ata_initialized(&self.bounding_curve_reserve_pair_ata, &self.pair.to_account_info(), &self.bounding_curve_reserve.to_account_info())?;
        self.ensure_user_position_initialized()?;

        let mut user_position = UserPosition::try_from_slice(&self.user_position.data.borrow()[8..])?;

        let amount_out = ConstantCurveCalculator::calculate_amount_out(
            params.amount,
            self.bounding_curve.virtual_token_balance,
            self.bounding_curve.virtual_pair_balance,
            TradeDirection::BtoA
        );

        let amount_in = params.amount;

        // Initialize user position if it's new
        if user_position.user == Pubkey::default() {
            user_position.user = self.payer.key();
            user_position.mint = self.mint.key();
        }
        
        user_position.contributed += amount_in;
        user_position.allocated_tokens += amount_out;
        user_position.refundable_remaining += amount_in;

        self.bounding_curve.net_active_capital += amount_in;
        self.bounding_curve.total_contributed += amount_in;

        let bounding_curve_key = self.bounding_curve.key();
        let signer_seeds_reserve = &[
            bounding_curve_key.as_ref(),
            CURVE_RESERVE_SEED.as_bytes(),
            &[self.bounding_curve.reserve_bump],
        ];
        let signer_seeds_reserve = &[&signer_seeds_reserve[..]];

        // Transfer pair tokens from payer to reserve
        transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    mint: self.pair.to_account_info(),
                    from: self.payer_pair_ata.to_account_info(),
                    to: self.bounding_curve_reserve_pair_ata.to_account_info(),
                    authority: self.payer.to_account_info(),
                }
            ),
            amount_in,
            self.pair.decimals,
        )?;

        // Transfer mint tokens from reserve to payer
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    mint: self.mint.to_account_info(),
                    from: self.bounding_curve_reserve_ata.to_account_info(),
                    to: self.payer_ata.to_account_info(),
                    authority: self.bounding_curve_reserve.to_account_info(),
                },
                signer_seeds_reserve,
            ),
            amount_out,
            self.mint.decimals,
        )?;

        // Save UserPosition (skip 8-byte discriminator)
        user_position.serialize(&mut &mut self.user_position.data.borrow_mut()[8..])?;

        if self.bounding_curve.net_active_capital >= self.bounding_curve.maximum_pair_balance  {
            self.bounding_curve.tradeable = false;
            let clock = Clock::get()?;
            emit!(MigrateTriggerEvent { mint: self.mint.key(), timestamp: clock.unix_timestamp });
        }

        Ok((amount_out, amount_in))
    }

    #[inline(never)]
    fn process_sell(&mut self, params: &SwapParams) -> Result<(u64, u64)> {
        if self.user_position.data_is_empty() {
             return err!(SwapTokenError::InvalidAmount);
        }
        let mut user_position = UserPosition::try_from_slice(&self.user_position.data.borrow()[8..])?;

        let amount_in = params.amount;
        
        if user_position.allocated_tokens == 0 || user_position.allocated_tokens < amount_in {
            return err!(SwapTokenError::InvalidAmount);
        }

        // Validation & Init ATAs for sell
        self.ensure_ata_initialized(&self.payer_pair_ata, &self.pair.to_account_info(), &self.payer.to_account_info())?;
        self.ensure_ata_initialized(&self.fee_receiver_pair_ata, &self.pair.to_account_info(), &self.fee_receiver.to_account_info())?;

        let total_out = ((user_position.refundable_remaining as u128 * amount_in as u128) / user_position.allocated_tokens as u128) as u64;
        let fee_out = total_out * 5 / 100;
        let amount_out = total_out - fee_out;

        user_position.allocated_tokens -= amount_in;
        user_position.burned_tokens += amount_in;
        user_position.refundable_remaining -= total_out;
        user_position.refunded += amount_out;

        self.bounding_curve.net_active_capital -= total_out;
        self.bounding_curve.total_burned_tokens += amount_in;
        self.bounding_curve.total_fees_collected += fee_out;

        let bounding_curve_key = self.bounding_curve.key();
        let signer_seeds_reserve = &[
            bounding_curve_key.as_ref(),
            CURVE_RESERVE_SEED.as_bytes(),
            &[self.bounding_curve.reserve_bump],
        ];
        let signer_seeds_reserve = &[&signer_seeds_reserve[..]];

        // Burn tokens from payer
        burn(
            CpiContext::new(
                self.token_program.to_account_info(),
                Burn {
                    mint: self.mint.to_account_info(),
                    from: self.payer_ata.to_account_info(),
                    authority: self.payer.to_account_info(),
                }
            ),
            amount_in,
        )?;

        // Transfer pair tokens from reserve to payer
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    mint: self.pair.to_account_info(),
                    to: self.payer_pair_ata.to_account_info(),
                    from: self.bounding_curve_reserve_pair_ata.to_account_info(),
                    authority: self.bounding_curve_reserve.to_account_info(),
                },
                signer_seeds_reserve,
            ),
            amount_out,
            self.pair.decimals,
        )?;

        // Transfer fee to fee receiver
        transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    mint: self.pair.to_account_info(),
                    to: self.fee_receiver_pair_ata.to_account_info(),
                    from: self.bounding_curve_reserve_pair_ata.to_account_info(),
                    authority: self.bounding_curve_reserve.to_account_info(),
                },
                signer_seeds_reserve,
            ),
            fee_out,
            self.pair.decimals,
        )?;

        // Sync Native for SOL wrapped tokens
        sync_native(
            CpiContext::new(
                self.token_program.to_account_info(),
                SyncNative { account: self.payer_pair_ata.to_account_info() }
            )
        )?;

        // Save UserPosition (skip 8-byte discriminator)
        user_position.serialize(&mut &mut self.user_position.data.borrow_mut()[8..])?;

        Ok((amount_in, amount_out))
    }
}
