use anchor_lang::prelude::*;

pub mod constant_curve;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug)]
pub enum TradeDirection {
    AtoB = 0,
    BtoA = 1,
}

pub trait CurveCalculator {
    fn calculate_initial_price(&self) -> u64;
    fn calculate_amount_out(
        amount: u64,
        virtual_token_reserve: u64,
        virtual_pair_reserve: u64,
        direction: TradeDirection
    ) -> u64;
}
