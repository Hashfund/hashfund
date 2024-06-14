use std::ops::Add;

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    clock::Clock,
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    system_instruction::transfer,
    sysvar::Sysvar,
};
use spl_token::instruction::sync_native;

use crate::{
    account::swap_account::SwapAccount,
    curve::calculator::{CurveCalculator, TradeDirection},
    error,
    events::{emit, Event},
};

pub mod payload;

pub const BOUNDING_CURVE_INFO_SIZE: usize = 8 + 8 + 32 + 1;

#[derive(BorshSerialize, BorshDeserialize, Clone, Copy)]
pub struct BoundingCurveInfo {
    pub initial_price: u64,
    pub maximum_market_cap: u64,
    pub mint: Pubkey,
    pub can_trade: bool,
}

impl BoundingCurveInfo {
    pub fn swap_in<T: CurveCalculator>(
        &self,
        accounts: &SwapAccount,
        native_amount: u64,
        signers_seeds: &[&[&[u8]]],
    ) -> Result<Self, ProgramError> {
        let mut state = self.clone();

        let token_amount: u64 = T::calculate_token_out(
            self.initial_price.into(),
            native_amount.into(),
            TradeDirection::AtoB,
        )
        .try_into()
        .unwrap();

        let bounding_curve_token_a_account =
            spl_token::state::Account::unpack(&accounts.token_a_source.data.try_borrow().unwrap())?;

        let bounding_curve_token_b_account = spl_token::state::Account::unpack(
            &accounts.token_b_destination.data.try_borrow().unwrap(),
        )?;

        if token_amount > bounding_curve_token_a_account.amount {
            return Err(error::TokenMintError::InsufficientTokenInReserve.into());
        }

        let market_cap = bounding_curve_token_b_account.amount;

        msg!(
            "market_cap={}, \n maximum_market_cap={}, \n new_marketcap={}",
            market_cap,
            self.maximum_market_cap,
            market_cap.add(native_amount)
        );

        if market_cap > self.maximum_market_cap {
            state.can_trade = false;
        }

        invoke(
            &transfer(
                accounts.payer.key,
                accounts.token_b_destination.key,
                native_amount,
            ),
            &[
                accounts.payer.clone(),
                accounts.token_b_destination.clone(),
                accounts.system_program.clone(),
            ],
        )?;

        invoke(
            &sync_native(accounts.token_program.key, accounts.token_b_destination.key)?,
            &[accounts.token_b_destination.clone()],
        )?;

        invoke_signed(
            &spl_token::instruction::transfer(
                accounts.token_program.key,
                &accounts.token_a_source.key,
                &accounts.token_a_destination.key,
                &accounts.bounding_curve.key,
                &[],
                native_amount,
            )?,
            &[
                accounts.token_a_source.clone(),
                accounts.token_a_destination.clone(),
                accounts.bounding_curve.clone(),
                accounts.token_program.clone(),
            ],
            signers_seeds,
        )?;

        let clock = Clock::get()?;

        emit(Event::Swap {
            amount_in: native_amount,
            amount_out: token_amount,
            trade_direction: 0,
            timestamp: clock.unix_timestamp,
            mint: accounts.token_a_mint.key.clone(),
            market_cap: market_cap.add(native_amount),
            payer: accounts.payer.key.clone(),
        });

        Ok(state)
    }

    pub fn swap_out<T: CurveCalculator>(
        &self,
        accounts: &SwapAccount,
        amount: u64,
        signers_seeds: &[&[&[u8]]],
    ) -> ProgramResult {
        let token_b_source_info =
            spl_token::state::Account::unpack(&accounts.token_b_source.data.borrow())?;

        let price = T::calculate_token_out(
            self.initial_price.into(),
            amount.into(),
            TradeDirection::BtoA,
        );

        let price: u64 = price.try_into().unwrap();

        invoke(
            &spl_token::instruction::transfer(
                accounts.token_program.key,
                &accounts.token_a_source.key,
                &accounts.token_a_destination.key,
                &accounts.payer.key,
                &[],
                amount,
            )?,
            &[
                accounts.token_a_source.clone(),
                accounts.token_a_destination.clone(),
                accounts.payer.clone(),
                accounts.token_program.clone(),
            ],
        )?;

        invoke_signed(
            &spl_token::instruction::transfer(
                accounts.token_program.key,
                accounts.token_b_source.key,
                accounts.token_b_destination.key,
                accounts.bounding_curve.key,
                &[],
                price.try_into().unwrap(),
            )?,
            &[
                accounts.token_b_source.clone(),
                accounts.token_b_destination.clone(),
                accounts.bounding_curve.clone(),
                accounts.token_program.clone(),
            ],
            signers_seeds,
        )?;

        let clock = Clock::get()?;

        emit(Event::Swap {
            amount_in: amount,
            amount_out: price,
            trade_direction: 1,
            timestamp: clock.unix_timestamp,
            mint: accounts.token_a_mint.key.clone(),
            market_cap: token_b_source_info.amount.add(price),
            payer: accounts.payer.key.clone(),
        });

        Ok(())
    }
}
