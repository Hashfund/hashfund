import type BN from "bn.js";
import Borsh from "@project-serum/borsh";
import type { PublicKey } from "@solana/web3.js";

import { SafeMath, Schema, SwapSchema } from "./schema";

export class BoundingCurveInfo extends Schema {
  static schema = Borsh.struct([
    SafeMath.buildSchema("initial_price"),
    Borsh.u64("initial_market_cap"),
    Borsh.u64("maximum_market_cap"),
    Borsh.publicKey("mint"),
    Borsh.bool("can_trade"),
    Borsh.bool("is_hashed"),
  ]);

  public readonly can_trade!: boolean;
  public readonly is_hashed!: boolean;
  public readonly initial_price!: BN;
  public readonly initial_market_cap!: BN;
  public readonly maximum_market_cap!: BN;
  public readonly mint!: PublicKey;
}
