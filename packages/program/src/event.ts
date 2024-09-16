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
  initial_price: SafeMath;
  curve_initial_supply: BN;
  initial_market_cap: BN;
  maximum_market_cap: BN;
  timestamp: BN;
};

type SwapEvent = {
  mint: PublicKey;
  amount_in: BN;
  amount_out: BN;
  trade_direction: number;
  market_cap: BN;
  virtual_market_cap: BN;
  timestamp: BN;
  payer: PublicKey;
};

export type HashMatureEvent = {
  mint: PublicKey;
  boundingCurve: PublicKey;
  timestamp: BN;
};

export type HashTokenEvent = {
  market?: PublicKey;
  amm: PublicKey;
  coin_amount: BN;
  pc_amount: BN;
  token_a_mint: PublicKey;
  token_b_mint: PublicKey;
  timestamp: BN;
};

export type Event = {
  Mint?: MintEvent;
  MintTo?: MintToEvent;
  InitializeCurve?: InitializeCurveEvent;
  Swap?: SwapEvent;
  HashToken?: HashTokenEvent;
  HashMature?: HashMatureEvent;
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
        SafeMath.buildSchema("initial_price"),
        Borsh.u64("curve_initial_supply"),
        Borsh.u64("initial_market_cap"),
        Borsh.u64("maximum_market_cap"),
        Borsh.i64("timestamp"),
      ],
      "InitializeCurve"
    ),
    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.publicKey("bounding_curve"),
        Borsh.i64("timestamp"),
      ],
      "HashMature"
    ),

    Borsh.struct(
      [
        Borsh.publicKey("mint"),
        Borsh.u64("amount_in"),
        Borsh.u64("amount_out"),
        Borsh.u8("trade_direction"),
        Borsh.u64("market_cap"),
        Borsh.u64("virtual_market_cap"),
        Borsh.i64("timestamp"),
        Borsh.publicKey("payer"),
      ],
      "Swap"
    ),
    Borsh.struct(
      [
        Borsh.publicKey("token_a_mint"),
        Borsh.publicKey("token_b_mint"),
        Borsh.option(Borsh.publicKey(), "market"),
        Borsh.publicKey("amm"),
        Borsh.u64("coin_amount"),
        Borsh.u64("pc_amount"),
        Borsh.i64("timestamp"),
      ],
      "HashToken"
    ),
  ]);
}
