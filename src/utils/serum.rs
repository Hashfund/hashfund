use solana_program::pubkey::Pubkey;

pub fn find_serum_market_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_market", &mint.to_bytes()], program_id)
}

pub fn find_serum_bids_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_bids", &mint.to_bytes()], program_id)
}

pub fn find_serum_asks_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_asks", &mint.to_bytes()], program_id)
}

pub fn find_serum_request_queue_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_request_queue", &mint.to_bytes()], program_id)
}

pub fn find_serum_event_queue_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_event_queue", &mint.to_bytes()], program_id)
}

/// This should be the base vault
/// Generate associate token account for each token vault
pub fn find_serum_token_vault_pda(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"serum_token_vault", &mint.to_bytes()], program_id)
}
