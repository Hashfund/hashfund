pub trait CurveCalculator {
    fn calculate_initial_price(&self) -> u128;
    fn calculate_token_out(initial_price: u128, amount: u128, trade_direction: TradeDirection) -> u128;
}

pub enum TradeDirection {
    AtoB,
    BtoA,
}
