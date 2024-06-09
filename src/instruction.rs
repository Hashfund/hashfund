use borsh::BorshDeserialize;
use solana_program::{msg, program_error::ProgramError};

use crate::state::payload::{CreatePayload, MintPayload};

pub trait Instruction {
    fn unpack(input: &[u8]) -> Result<Self, ProgramError>
    where
        Self: Sized;

    fn pack(&self) -> &[u8];
}

pub enum ProgramInstruction {
    Create(CreatePayload),
    Mint(MintPayload),
}

impl Instruction for ProgramInstruction {
    fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        match variant {
            0 => {
                let payload = CreatePayload::try_from_slice(rest).unwrap();

                msg!("payload decoded");

                Ok(ProgramInstruction::Create(payload))
            }
            1 => {
                let payload = MintPayload::try_from_slice(rest).unwrap();

                Ok(ProgramInstruction::Mint(payload))
            }
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }

    fn pack(&self) -> &[u8] {
        &[8]
    }
}
