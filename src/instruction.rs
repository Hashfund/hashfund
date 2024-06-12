use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

use crate::state::payload::{
    InitializeCurvePayload, InitializeMintPayload, MintToPayload, SwapPayload,
};

pub trait Instruction {
    fn unpack(input: &[u8]) -> Result<Self, ProgramError>
    where
        Self: Sized;

    fn pack(&self) -> &[u8];
}

pub enum ProgramInstruction {
    InitializeMint(InitializeMintPayload),
    MintTo(MintToPayload),
    InitializeCurve(InitializeCurvePayload),
    Swap(SwapPayload),
}

impl Instruction for ProgramInstruction {
    fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        match variant {
            0 => Ok(ProgramInstruction::InitializeMint(
                InitializeMintPayload::try_from_slice(rest).unwrap(),
            )),
            1 => Ok(ProgramInstruction::MintTo(
                MintToPayload::try_from_slice(rest).unwrap(),
            )),
            2 => Ok(ProgramInstruction::InitializeCurve(
                InitializeCurvePayload::try_from_slice(rest).unwrap(),
            )),
            3 => Ok(ProgramInstruction::Swap(
                SwapPayload::try_from_slice(rest).unwrap(),
            )),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }

    fn pack(&self) -> &[u8] {
        &[8]
    }
}
