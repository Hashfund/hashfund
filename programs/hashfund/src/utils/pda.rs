use solana_program::pubkey::Pubkey;
use spl_associated_token_account::get_associated_token_address;

pub fn find_mint_authority_id(owner: &Pubkey, mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[b"mint_authority", owner.as_ref(), mint.as_ref()],
        program_id,
    )
}

pub fn find_bounding_curve(mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"hashfund", mint.as_ref()], &program_id)
}

pub fn find_bounding_curve_reserve(bounding_curve: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[b"hashfund", bounding_curve.as_ref()], &program_id)
}

pub fn get_bounding_curve_ata(bounding_curve: &Pubkey, mint: &Pubkey) -> Pubkey {
    get_associated_token_address(&bounding_curve, mint)
}