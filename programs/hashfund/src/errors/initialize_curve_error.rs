use spl_program_error::*;

#[spl_program_error]
pub enum InitializeCurveError {
    #[error("Invalid bounding curve account")]
    IncorrectBoundingCurveAccount,
    #[error("Invalid bounding curve reserve account")]
    IncorrectBoundingCurveReserveAccount,
    #[error("Invalid bounding curve reserve ata account")]
    IncorrectBoundingCurveReserveATAAccount,
}
