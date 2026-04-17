use std::ops::Mul;

use curve::{ constant_curve::ConstantCurveCalculator, CurveCalculator, TradeDirection };

fn main() {
    let supply = (1_000_000_000).mul((10_u64).pow(6));
    let liquidity_percentage = 50;

    let curve = ConstantCurveCalculator::new(
        supply,
        liquidity_percentage,
    );

    let bounding_supply = curve.get_bounding_curve_supply();
    let maximum_token_b_reserve_balance = curve.get_token_b_reserve_balance();
    let initial_price = curve.calculate_initial_price();

    println!("price={:?}", initial_price);
    println!("supply={}", bounding_supply);
    println!("reserve={}", maximum_token_b_reserve_balance);

    let virtual_token_reserve = curve.get_virtual_token_reserve();
    let virtual_pair_reserve = curve.get_token_b_reserve_balance();

    let token_a =  ConstantCurveCalculator::calculate_amount_out(
        1_000_000_000,
        virtual_token_reserve,
        virtual_pair_reserve,
        TradeDirection::BtoA
    );

    println!(
        "token a={}",
       token_a
    );
    println!(
        "token b={}",
        ConstantCurveCalculator::calculate_amount_out(
            token_a,
            virtual_token_reserve,
            virtual_pair_reserve,
           TradeDirection::AtoB
        )
    );
}
