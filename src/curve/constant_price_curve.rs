use std::ops::{Div, Mul};

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

pub const C: f64 = 500_f64;
pub const W: f64 = 1_f64;

impl CurveCalculator for ConstantPriceCurve {
    fn calculate_initial_price_f64(p0: f64, c: f64, t: f64, w: f64) -> f64 {
        p0.ln().mul(c.mul(w)).div(t)
    }

    fn calculate_initial_price(&self) -> u128 {
        let total_supply_f64 = self.token_a_total_supply as f64;
        let initial_price_f64 = self.token_b_initial_deposit as f64;

        // constants
        let weight_f64 = W.mul(self.token_a_denominator as f64);
        let base_collateral_f64 = C.mul(self.token_b_denominator as f64);

        Self::calculate_initial_price_f64(
            initial_price_f64,
            base_collateral_f64,
            total_supply_f64,
            weight_f64,
        ) as u128
    }

    fn calculate_token_out(
        initial_price: u128,
        amount: u128,
        trade_direction: TradeDirection,
    ) -> u128 {
        match trade_direction {
            TradeDirection::BtoA => (amount).mul(initial_price),
            TradeDirection::AtoB => (amount).div(initial_price),
        }
    }
}
