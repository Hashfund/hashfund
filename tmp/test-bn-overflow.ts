import { BN } from "@coral-xyz/anchor";
import { unsafeBnToNumber } from "../packages/bn/src/index";

const largeValue = new BN("526581018446511310");
console.log("Input BN:", largeValue.toString());
try {
  const result = unsafeBnToNumber(largeValue, 9);
  console.log("Result (normalized by 9):", result);
  if (Math.abs(result - 526581018.4465113) < 0.01) {
    console.log("SUCCESS: Large BN converted safely.");
  } else {
    console.log("FAILURE: Precision loss too high or incorrect value.");
  }
} catch (err) {
  console.error("FAILURE: Threw error:", err);
}
