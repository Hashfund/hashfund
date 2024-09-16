use base64::{display::Base64Display, engine::general_purpose::STANDARD};
use borsh::BorshSerialize;
use bounding_curve::safe_number::SafeNumber;
use solana_program::{msg, pubkey::Pubkey};

#[derive(BorshSerialize)]
pub enum Event {
    Mint {
        mint: Pubkey,
        timestamp: i64,
        name: String,
        ticker: String,
        uri: String,
        creator: Pubkey,
    },
    MintTo {
        mint: Pubkey,
        reserve: Pubkey,
        amount: u64,
        timestamp: i64,
    },
    InitializeCurve {
        mint: Pubkey,
        bounding_curve: Pubkey,
        initial_price: SafeNumber,
        curve_initial_supply: u64,
        initial_market_cap: u64,
        maximum_market_cap: u64,
        timestamp: i64,
    },
    HashMature {
        mint: Pubkey,
        bounding_curve: Pubkey,
        timestamp: i64,
    },
    Swap {
        mint: Pubkey,
        amount_in: u64,
        amount_out: u64,
        trade_direction: u8,
        market_cap: u64,
        virtual_market_cap: u64,
        timestamp: i64,
        payer: Pubkey,
    },
    HashToken {
        token_a_mint: Pubkey,
        token_b_mint: Pubkey,
        market: Option<Pubkey>,
        amm: Pubkey,
        coin_amount: u64,
        pc_amount: u64,
        timestamp: i64,
    },
}

pub fn emit(data: Event) {
    let data = borsh::to_vec(&data).unwrap();
    let value = Base64Display::new(&data, &STANDARD);
    msg!(&format!("emit!{}", value))
}
