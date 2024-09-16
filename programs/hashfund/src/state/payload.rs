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
    pub supply_fraction: u8,
    pub maximum_market_cap: u64,
}

#[derive(BorshDeserialize)]
pub struct SwapPayload {
    pub amount: u64,
    pub direction: u8,
    pub can_hash: Option<bool>,
}

#[derive(BorshDeserialize)]
pub struct HashTokenPayload {
    pub coin_lot_size: u64,
    pub pc_lot_size: u64,
    pub vault_signer_nonce: u64,
    pub pc_dust_threshold: u64,
    pub open_time: u64,
    pub nonce: u8,
}


#[derive(BorshDeserialize)]
pub struct HashTokenPayloadV2 {
    pub open_time: u64,
    pub estimated_pool_creation_fee: u64,
}
