use std::ops::{Add, Div, Mul};

use super::calculator::{CurveCalculator, TradeDirection};

pub struct ConstantPriceCurve {
    token_a_total_supply: u128,
    token_b_initial_deposit: u128,
    token_a_denominator: u128,
    token_b_denominator: u128,
}

impl ConstantPriceCurve {
    pub fn new(
        token_a_total_supply: u128,
        token_b_initial_deposit: u128,
        token_a_denominator: u128,
        token_b_denominator: u128,
    ) -> Self {
        Self {
            token_a_total_supply,
            token_b_initial_deposit,
            token_a_denominator,
            token_b_denominator,
        }
    }

    pub fn normalize_price(&self, price: u128, trade_direction: TradeDirection) -> u64 {
        let price = match trade_direction {
            TradeDirection::AtoB => price.div(self.token_b_denominator),
            TradeDirection::BtoA => price.div(self.token_a_denominator),
        } as u64;

        price
    }
}

impl CurveCalculator for ConstantPriceCurve {
    fn calculate_initial_price(&self) -> u128 {
        let offset = 1;
        let adjustment_factor = self.token_b_denominator.div(10);
        let base_price = self.token_b_initial_deposit.div(self.token_a_total_supply);

        base_price.add(
            offset.add(
                adjustment_factor.mul(offset.add(self.token_b_initial_deposit).ilog10() as u128),
            ),
        )
    }

    fn calculate_token_out(initial_price: u128, amount: u128, trade_direction: TradeDirection) -> u128 {
        match trade_direction {
            TradeDirection::AtoB => amount.mul(initial_price),
            TradeDirection::BtoA => amount.div(initial_price),
        }
    }
}
