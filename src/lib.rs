use account::hash_token_account_v2::HashTokenAccountV2;
use context::Context;
use errors::hash_token_error::HashTokenError;
use instruction::{Instruction, ProgramInstruction};
use num_traits::FromPrimitive;
use solana_program::{
    account_info::{next_account_infos, AccountInfo},
    declare_id,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use state::payload::HashTokenPayloadV2;
use utils::raydium::get_estimated_creation_fee;

pub mod account;
pub mod context;
pub mod cpi;
pub mod errors;
pub mod events;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod utils;

solana_program::entrypoint!(process_instruction);

pub mod create_mint_fee_receiver {

    super::declare_id!("8yrLUREzVZ47fqLZ2jBSqBdsUivSeEy8GaqY8WVvd3Nc");
}

pub mod swap_fee_receiver {

    super::declare_id!("9AajQJL4MYX8ttZWr5uHMsoGWMKaCG6SzDjTFm59qhEe");
}
pub mod hash_token_fee_receiver {

    super::declare_id!("9AajQJL4MYX8ttZWr5uHMsoGWMKaCG6SzDjTFm59qhEe");
}

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
            let account_infos = &mut account_infos.iter();
            let context =
                Context::new(program_id, next_account_infos(account_infos, 14)?, payload)?;

            processor::process_swap(&context)?;

            if let Some(can_hash) = context.payload.can_hash {
                if can_hash {
                    let context = Box::new(Context {
                        program_id,
                        payload: HashTokenPayloadV2 {
                            open_time: 0,
                            estimated_pool_creation_fee: get_estimated_creation_fee(),
                        },
                        accounts: HashTokenAccountV2::with_default(
                            context.accounts.sysvar_rent.clone(),
                            context.accounts.system_program.clone(),
                            context.accounts.token_program.clone(),
                            context.accounts.associate_token_program.clone(),
                            context.accounts.bounding_curve.clone(),
                            context.accounts.bounding_curve_reserve.clone(),
                            next_account_infos(account_infos, 15)?,
                        )?,
                    });

                    match processor::process_hash_token_v2(&context) {
                        Ok(()) => Ok(()),
                        Err(ProgramError::Custom(error)) => {
                            if let Some(error) = HashTokenError::from_u32(error) {
                                match error {
                                    HashTokenError::ImmatureBoundingCurve => Ok(()),
                                    HashTokenError::InvalidHashBoundingCurve => {
                                        Err(HashTokenError::InvalidHashBoundingCurve.into())
                                    }
                                }
                            } else {
                                Ok(())
                            }
                        }
                        _ => Err(ProgramError::InvalidArgument),
                    }
                } else {
                    Ok(())
                }
            } else {
                Ok(())
            }
        }
        ProgramInstruction::HashToken(payload) => {
            processor::process_hash_token(&Context::new(program_id, account_infos, payload)?)
        }
        ProgramInstruction::HashTokenV2(payload) => {
            processor::process_hash_token_v2(&Context::new(program_id, account_infos, payload)?)
        }
    }
}
