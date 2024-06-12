use std::ops::Add;

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    entrypoint::ProgramResult,
    msg,
    program::{invoke, invoke_signed},
    program_error::ProgramError,
    program_pack::Pack,
    pubkey::Pubkey,
    system_instruction::transfer,
};
use spl_token::instruction::sync_native;

use crate::{
    account::swap_account::SwapAccount,
    curve::calculator::{CurveCalculator, TradeDirection},
    error,
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

        let bounding_curve_token_account =
            spl_token::state::Account::unpack(&accounts.token_a_source.data.try_borrow().unwrap())?;

        if token_amount > bounding_curve_token_account.amount {
            msg!(
                "insufficient token in {}, amount={}, input={}",
                accounts.bounding_curve.key.to_string(),
                bounding_curve_token_account.amount,
                token_amount
            );
            return Err(error::TokenMintError::InsufficientTokenInReserve.into());
        }

        msg!("max_market_cap={}", self.maximum_market_cap);
        msg!(
            "bounding_curve_balance={}",
            bounding_curve_token_account.amount
        );

        if bounding_curve_token_account.amount.add(native_amount) >= self.maximum_market_cap {
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

        msg!("token_program={}", accounts.token_program.key.to_string());

        invoke(
            &sync_native(accounts.token_program.key, accounts.token_b_destination.key)?,
            &[accounts.token_b_destination.clone()],
        )?;

        msg!("sending you your token...");

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

        Ok(state)
    }

    pub fn swap_out<T: CurveCalculator>(
        &self,
        accounts: &SwapAccount,
        amount: u64,
        signers_seeds: &[&[&[u8]]],
    ) -> ProgramResult {
        let price = T::calculate_token_out(
            self.initial_price.into(),
            amount.into(),
            TradeDirection::BtoA,
        );

        msg!("selling token={} for={}SOL", amount, price);

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

        msg!(
            "sending you sol={} , price={}",
            accounts.bounding_curve.key.to_string(),
            price
        );

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

        Ok(())
    }
}
