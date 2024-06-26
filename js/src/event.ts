import type BN from "bn.js";
import Borsh from "@project-serum/borsh";

import type { PublicKey } from "@solana/web3.js";

import { SafeMath, Schema } from "./schema";

type MintEvent = {
  mint: PublicKey;
  timestamp: BN;
  name: string;
  ticker: string;
  uri: string;
  creator: PublicKey;
};

type MintToEvent = {
  mint: PublicKey;
  reserve: PublicKey;
  amount: BN;
  timestamp: BN;
};

type InitializeCurveEvent = {
  mint: PublicKey;
  bounding_curve: PublicKey;
  initial_price: BN;
  maximum_market_cap: BN;
  timestamp: BN;
};

type SwapEvent = {
  mint: PublicKey;
  amount_in: BN;
  amount_out: BN;
  trade_direction: number;
  market_cap: BN;
  timestamp: BN;
  payer: PublicKey;
};

export type Event = {
  Mint?: MintEvent;
  MintTo?: MintToEvent;
  InitializeCurve?: InitializeCurveEvent;
  Swap?: SwapEvent;
};

export class EventSchema extends Schema {
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
        SafeMath.schema,
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
        Borsh.publicKey("payer"),
      ],
      "Swap"
    ),
  ]);
}
