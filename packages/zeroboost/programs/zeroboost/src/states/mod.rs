use anchor_lang::prelude::*;

pub mod config;
pub mod bounding_curve;
pub mod user_position;

pub use config::*;
pub use bounding_curve::*;
pub use user_position::*;

#[account]
pub struct  ZeroAccount {
  owner: Pubkey
}