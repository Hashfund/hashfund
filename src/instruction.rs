use borsh::BorshDeserialize;
use solana_program::{msg, program_error::ProgramError};

use crate::state::payload::{
    HashTokenPayload, InitializeCurvePayload, InitializeMintPayload, MintToPayload, SwapPayload,
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
    HashToken(HashTokenPayload),
}

impl Instruction for ProgramInstruction {
    fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;

        msg!("variant={}", variant);

        match variant {
            0 => Ok(Self::InitializeMint(
                InitializeMintPayload::try_from_slice(rest).unwrap(),
            )),
            1 => Ok(Self::MintTo(MintToPayload::try_from_slice(rest).unwrap())),
            2 => Ok(Self::InitializeCurve(
                InitializeCurvePayload::try_from_slice(rest).unwrap(),
            )),
            3 => Ok(Self::HashToken(
                HashTokenPayload::try_from_slice(rest).unwrap(),
            )),
            4 => Ok(Self::Swap(SwapPayload::try_from_slice(rest).unwrap())),
            _ => Err(ProgramError::InvalidInstructionData),
        }
    }

    fn pack(&self) -> &[u8] {
        &[8]
    }
}
