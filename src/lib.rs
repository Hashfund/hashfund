use instruction::{Instruction, ProgramInstruction};
use solana_program::{account_info::AccountInfo, entrypoint::ProgramResult, pubkey::Pubkey};

pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;

solana_program::entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    account_infos: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = ProgramInstruction::unpack(&instruction_data)?;
    match instruction {
        ProgramInstruction::Create(payload) => {
            processor::initialize_mint_token(program_id, account_infos, &payload)
        }
        ProgramInstruction::Mint(payload) => {
            processor::mint_token_to(program_id, account_infos, &payload)
        }
    }
}
