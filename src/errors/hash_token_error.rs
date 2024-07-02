use spl_program_error::*;

#[spl_program_error]
pub enum HashTokenError {
    #[error("Inmature bounding curve")]
    ImmatureBoundingCurve,
    #[error("Can't hash this bounding curve")]
    InvalidHashBoundingCurve,
}
