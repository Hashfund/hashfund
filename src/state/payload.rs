use borsh::BorshDeserialize;

#[derive(BorshDeserialize)]
pub struct InitializeMintPayload {
    pub decimals: u8,
    pub name: String,
    pub ticker: String,
    pub uri: String,
}

#[derive(BorshDeserialize)]
pub struct MintToPayload {
    pub amount: u64,
}

#[derive(BorshDeserialize)]
pub struct InitializeCurvePayload {
    pub initial_buy_amount: u64,
    pub maximum_market_cap: u64,
}

#[derive(BorshDeserialize)]
pub struct SwapPayload {
    pub amount: u64,
    pub direction: u8,
}
