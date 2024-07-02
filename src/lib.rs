use context::Context;
use instruction::{Instruction, ProgramInstruction};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

pub mod account;
pub mod context;
pub mod errors;
pub mod events;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;

solana_program::entrypoint!(process_instruction);

pub fn process_instruction<'a>(
    program_id: &'a Pubkey,
    account_infos: &'a [AccountInfo<'a>],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = ProgramInstruction::unpack(&instruction_data)?;

    match instruction {
        ProgramInstruction::InitializeMint(payload) => {
            processor::process_initialize_mint(&Context::new(program_id, account_infos, payload)?)
        }
        ProgramInstruction::MintTo(payload) => {
            processor::process_mint_to(&Context::new(program_id, account_infos, payload)?)
        }

        ProgramInstruction::InitializeCurve(payload) => {
            processor::process_initialize_curve(&Context::new(program_id, account_infos, payload)?)
        }
        ProgramInstruction::Swap(payload) => {
            processor::process_swap(&Context::new(program_id, account_infos, payload)?)
        }
        ProgramInstruction::HashToken(payload) => {
            processor::process_hash_token(&Context::new(program_id, account_infos, payload)?)
        }
        ProgramInstruction::HashTokenV2(payload) => {
            processor::process_hash_token_v2(&Context::new(program_id, account_infos, payload)?)
        }
    }
}
