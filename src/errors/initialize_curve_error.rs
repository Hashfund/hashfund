use spl_program_error::*;

#[spl_program_error]
pub enum InitializeCurveError {
    #[error("Invalid bounding curve account")]
    IncorrectBoundingCurveAccount,
}
