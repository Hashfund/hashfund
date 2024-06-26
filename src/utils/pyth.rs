use bounding_curve::safe_number::SafeNumber;
use pyth_sdk_solana::Price;

pub fn price_to_number(price: Price) -> SafeNumber {
   SafeNumber::new(
     price.price as f64 / 10f64.powi(-price.expo as i32)
   )
}
