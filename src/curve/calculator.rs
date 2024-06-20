pub trait CurveCalculator {
    fn calculate_initial_price(&self) -> u128;
    fn calculate_initial_price_f64(p0: f64, c: f64, t: f64, w: f64) -> f64; 
    fn calculate_token_out(initial_price: u128, amount: u128, trade_direction: TradeDirection) -> u128;
}

pub enum TradeDirection {
    AtoB,
    BtoA,
}
