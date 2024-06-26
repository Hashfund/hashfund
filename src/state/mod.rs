use std::ops::{Add, Sub};

use borsh::{BorshDeserialize, BorshSerialize};
use bounding_curve::{
    curve::calculator::{CurveCalculator, TradeDirection},
    safe_number::{SafeNumber, SAFE_MATH_SIZE},
};
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
    errors::swap_error::SwapError,
    events::{emit, Event},
};

pub mod payload;

pub const BOUNDING_CURVE_INFO_SIZE: usize = 8 + 8 + 32 + 1 + SAFE_MATH_SIZE;

#[derive(BorshSerialize, BorshDeserialize, Clone, Copy)]
pub struct BoundingCurveInfo {
    pub initial_price: SafeNumber,
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
            TradeDirection::BtoA,
        )
        .try_into()
        .unwrap();

        let native_amount: u64 = T::calculate_token_out(
            self.initial_price.into(),
            token_amount.into(),
            TradeDirection::AtoB,
        )
        .try_into()
        .unwrap();

        msg!("token_amount={}", token_amount);
        msg!("native_amount={}", native_amount);

        let bounding_curve_token_a_account =
            spl_token::state::Account::unpack(&accounts.token_a_source.data.try_borrow().unwrap())?;

        let bounding_curve_token_b_account = spl_token::state::Account::unpack(
            &accounts.token_b_destination.data.try_borrow().unwrap(),
        )?;

        if token_amount > bounding_curve_token_a_account.amount {
            return Err(SwapError::InsufficientTokenInReserve.into());
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
                token_amount,
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

        msg!("initial_price={:?}\n", self.initial_price);
        msg!("amount={}\n", amount);

        let native_amount = T::calculate_token_out(
            self.initial_price.into(),
            amount.into(),
            TradeDirection::AtoB,
        );

        let amount = T::calculate_token_out(
            self.initial_price.into(),
            native_amount,
            TradeDirection::BtoA,
        );

        let amount: u64 = amount.try_into().unwrap();
        let native_amount: u64 = native_amount.try_into().unwrap();
        msg!("native_amount={}\n", native_amount);

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
                native_amount.try_into().unwrap(),
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
            amount_out: native_amount,
            trade_direction: 1,
            timestamp: clock.unix_timestamp,
            mint: accounts.token_a_mint.key.clone(),
            market_cap: token_b_source_info.amount.sub(native_amount),
            payer: accounts.payer.key.clone(),
        });

        Ok(())
    }
}
