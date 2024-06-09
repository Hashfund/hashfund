use borsh::BorshDeserialize;

#[derive(BorshDeserialize)]
pub struct CreatePayload {
    pub decimals: u8,
    pub name: String,
    pub ticker: String,
    pub uri: String,
}

#[derive(BorshDeserialize)]
pub struct MintPayload {
    pub amount: u64,
}
