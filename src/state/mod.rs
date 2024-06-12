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
            spl_token::state::Account::unpack(&accounts.source.data.try_borrow().unwrap())?;

        if token_amount > bounding_curve_token_account.amount {
            return Err(error::TokenMintError::InsufficientTokenInReserve.into());
        }

        if accounts.bounding_curve.lamports().add(native_amount) >= self.maximum_market_cap {
            state.can_trade = false;
        }

        invoke(
            &transfer(
                accounts.payer.key,
                accounts.bounding_curve.key,
                native_amount,
            ),
            &[
                accounts.payer.clone(),
                accounts.bounding_curve.clone(),
                accounts.system_program.clone(),
            ],
        )?;

        invoke_signed(
            &spl_token::instruction::transfer(
                accounts.token_program.key,
                &accounts.source.key,
                &accounts.destination.key,
                &accounts.bounding_curve.key,
                &[],
                native_amount,
            )?,
            &[
                accounts.source.clone(),
                accounts.destination.clone(),
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
                &accounts.source.key,
                &accounts.destination.key,
                &accounts.payer.key,
                &[],
                amount,
            )?,
            &[
                accounts.source.clone(),
                accounts.destination.clone(),
                accounts.payer.clone(),
                accounts.token_program.clone(),
            ],
        )?;

        msg!("sending you sol");

        invoke_signed(
            &transfer(
                accounts.bounding_curve.key,
                accounts.payer.key,
                price.try_into().unwrap(),
            ),
            &[accounts.bounding_curve.clone(), accounts.payer.clone()],
            signers_seeds,
        )?;

        Ok(())
    }
}
