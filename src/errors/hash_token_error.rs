use spl_program_error::*;

#[spl_program_error]
pub enum HashTokenError {
    #[error("Inmature bounding curve")]
    InmatureBoundingCurve,
}
