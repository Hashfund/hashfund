use std::ops::{Div, Sub};

use super::{CurveCalculator, TradeDirection};

pub struct ConstantCurveCalculator {
    supply: u64,
    liquidity_percentage: u8,
    vp_0: u64,
    vt_0: u64,
}

impl ConstantCurveCalculator {
    pub fn new(
        supply: u64,
        liquidity_percentage: u8,
    ) -> ConstantCurveCalculator {
        if supply == 0 {
            return ConstantCurveCalculator {
                supply: 0,
                liquidity_percentage,
                vp_0: 0,
                vt_0: 0,
            };
        }

        // alpha scaled by 1e9
        let mut alpha_scaled: u128 = 1_082_352_941;
        let beta: u64 = 30; // 30 SOL
        
        if liquidity_percentage == 50 {
            alpha_scaled = 772_727_272;
        } else if liquidity_percentage == 70 {
            alpha_scaled = 980_000_000;
        } else if liquidity_percentage == 90 {
            alpha_scaled = 1_184_210_526;
        }
        
        let supply_u128 = supply as u128;
        let vt_0_u128 = (supply_u128 * alpha_scaled) / 1_000_000_000;
        let vt_0 = vt_0_u128 as u64;
        
        let vp_0_sol = beta;
        let vp_0 = vp_0_sol * 1_000_000_000;

        ConstantCurveCalculator {
            supply,
            liquidity_percentage,
            vp_0,
            vt_0,
        }
    }

    pub fn get_token_b_reserve_balance(&self) -> u64 {
        self.vp_0
    }

    pub fn get_liquidity_supply(&self) -> u64 {
        self.supply.sub(self.get_bounding_curve_supply())
    }

    pub fn get_bounding_curve_supply(&self) -> u64 {
        ((self.supply as u128) * (self.liquidity_percentage as u128) / 100) as u64
    }

    pub fn get_virtual_token_reserve(&self) -> u64 {
        self.vt_0
    }
}

impl CurveCalculator for ConstantCurveCalculator {
    fn calculate_initial_price(&self) -> u64 {
        if self.vt_0 == 0 {
            return 0;
        }
        // Returns price scaled by 1e9
        ((self.vp_0 as u128 * 1_000_000_000) / (self.vt_0 as u128)) as u64
    }

    fn calculate_amount_out(
        amount: u64,
        virtual_token_reserve: u64,
        virtual_pair_reserve: u64,
        direction: TradeDirection
    ) -> u64 {
        let token_res = virtual_token_reserve as u128;
        let pair_res = virtual_pair_reserve as u128;
        let amt = amount as u128;
        
        match direction {
            TradeDirection::AtoB => {
                let new_token_res = token_res + amt;
                let k = token_res * pair_res;
                let new_pair_res = k / new_token_res;
                let out = pair_res - new_pair_res;
                out as u64
            },
            TradeDirection::BtoA => {
                let new_pair_res = pair_res + amt;
                let k = token_res * pair_res;
                let new_token_res = k.div(new_pair_res);
                let out = token_res - new_token_res;
                out as u64
            },
        }
    }
}

#[cfg(test)]
mod constant_curve_test {
    use crate::curve::CurveCalculator;
    use super::ConstantCurveCalculator;

    #[test]
    pub fn sell_mint_fraction_to_meet_maximum_token_b_balance() {
        let supply = 1_000_000_000 * 1_000_000;
        let liquidity_percentage = 50;
        let curve = ConstantCurveCalculator::new(
            supply,
            liquidity_percentage,
        );

        let bounding_supply = curve.get_bounding_curve_supply();
        let maximum_token_b_reserve_balance = curve.get_token_b_reserve_balance();
        let virtual_token_reserve = curve.get_virtual_token_reserve();
        let virtual_pair_reserve = curve.get_token_b_reserve_balance();

        let initial_price = curve.calculate_initial_price();

        let token_amount_out = ConstantCurveCalculator::calculate_amount_out(
            maximum_token_b_reserve_balance,
            virtual_token_reserve,
            virtual_pair_reserve,
            crate::curve::TradeDirection::BtoA
        );

        let token_b_amount_out = ConstantCurveCalculator::calculate_amount_out(
            bounding_supply,
            virtual_token_reserve,
            virtual_pair_reserve,
            crate::curve::TradeDirection::AtoB
        );

        assert!(token_amount_out > 0, "assert when bought total token");
        assert!(token_b_amount_out > 0, "assert when sell equal to curve token B supply");
        assert!(initial_price > 0, "assert initial price is non-zero");
    }
}
