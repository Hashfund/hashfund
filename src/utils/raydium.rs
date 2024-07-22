use std::ops::Mul;

pub fn get_estimated_creation_fee() -> u64 {
    2.mul(10_u64.pow(6)) + 15.mul(10_u64.pow(8)) + 203938.mul(10_u64.pow(1))
}
