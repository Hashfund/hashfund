import Borsh from "@project-serum/borsh";

import { Schema } from "./schema";

export class Event extends Schema {
  static schema = Borsh.rustEnum([
    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.i64("timestamp"),
        Borsh.str("name"),
        Borsh.str("ticker"),
        Borsh.str("uri"),
        Borsh.publicKey("creator"),
      ],
      "Mint"
    ),
    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.publicKey("reserve"),
        Borsh.u64("amount"),
        Borsh.i64("timestamp"),
      ],
      "MintTo"
    ),
    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.publicKey("bounding_curve"),
        Borsh.u64("initial_price"),
        Borsh.u64("maximum_market_cap"),
        Borsh.i64("timestamp"),
      ],
      "InitializeCurve"
    ),
    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.u64("amount_in"),
        Borsh.u64("amount_out"),
        Borsh.u8("trade_direction"),
        Borsh.u64("market_cap"),
        Borsh.i64("timestamp"),
      ],
      "Swap"
    ),
  ]);
}
