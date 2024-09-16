import BN from "bn.js";
import Borsh from "@project-serum/borsh";
import { safeBN, unsafeBN, unsafeBnToNumber } from "@solocker/safe-bn";

export enum SchemaVariant {
  CREATE = 0,
  MINT = 1,
  INITIALIZE_CURVE = 2,
  SWAP = 3,
  HASH_TOKEN = 4,
  HASH_TOKEN_V2 = 5,
}

export abstract class Schema {
  static schema: ReturnType<typeof Borsh.struct>;

  get Schema() {
    return this.constructor as typeof Schema;
  }

  serialize(bufferSize: number = 1024) {
    const Schema = this.Schema;
    const buffer = Buffer.alloc(bufferSize);

    Schema.schema.encode(
      {
        ...this,
      },
      buffer
    );

    return buffer.subarray(0, Schema.schema.getSpan(buffer));
  }

  static deserialize<T>(buffer: Buffer | null): T | null {
    if (!buffer) return null;
    return this.schema.decode(buffer);
  }
}

export class InitializeMintTokenSchema extends Schema {
  static schema = Borsh.struct([
    Borsh.u8("variant"),
    Borsh.u8("decimals"),
    Borsh.str("name"),
    Borsh.str("ticker"),
    Borsh.str("uri"),
  ]);

  public readonly name;
  public readonly variant = SchemaVariant.CREATE;

  constructor(
    name: string,
    public readonly ticker: string,
    public readonly uri: string,
    public readonly decimals: number
  ) {
    super();
    this.name = name.toUpperCase();
  }
}

export class MintTokenSchema extends Schema {
  static schema = Borsh.struct([Borsh.u8("variant"), Borsh.u64("amount")]);
  public readonly variant = SchemaVariant.MINT;

  constructor(public readonly amount: BN) {
    super();
  }
}

export class InitializeCurveSchema extends Schema {
  static schema = Borsh.struct([
    Borsh.u8("variant"),
    Borsh.u8("supply_fraction"),
    Borsh.u64("maximum_market_cap"),
  ]);

  public readonly variant = SchemaVariant.INITIALIZE_CURVE;

  constructor(
    public readonly supply_fraction: BN,
    public readonly maximum_market_cap: BN
  ) {
    super();
  }
}

export class HashTokenSchema extends Schema {
  static schema = Borsh.struct([
    Borsh.u8("variant"),
    Borsh.u64("coin_lot_size"),
    Borsh.u64("pc_lot_size"),
    Borsh.u64("vault_signer_nonce"),
    Borsh.u64("pc_dust_threshold"),
    Borsh.u64("open_time"),
    Borsh.u8("nonce"),
  ]);

  public readonly variant = SchemaVariant.HASH_TOKEN;

  constructor(
    public readonly coin_lot_size: BN,
    public readonly pc_lot_size: BN,
    public readonly vault_signer_nonce: BN,
    public readonly pc_dust_threshhold: BN,
    public readonly open_time: BN,
    public readonly nonce: BN
  ) {
    super();
  }
}

export class HashTokenV2Schema extends Schema {
  static schema = Borsh.struct([Borsh.u8("variant"), Borsh.u64("open_time")]);

  public readonly variant = SchemaVariant.HASH_TOKEN_V2;

  constructor(public readonly open_time: BN) {
    super();
  }
}

export class SwapSchema extends Schema {
  static schema = Borsh.struct([
    Borsh.u8("variant"),
    Borsh.u64("amount"),
    Borsh.u8("direction"),
    Borsh.option(Borsh.bool(), "can_hash"),
  ]);

  public readonly variant = SchemaVariant.SWAP;

  constructor(
    public readonly amount: BN,
    public readonly direction: 0 | 1,
    public can_hash?: boolean
  ) {
    super();
  }
}

export class SafeMath extends Schema {
  static buildSchema = (property: string) =>
    Borsh.struct([Borsh.u128("value"), Borsh.i32("percision")], property);

  static schema = SafeMath.buildSchema("SafeMath");

  constructor(public readonly value: BN, public readonly percision: number) {
    super();
  }

  static unwrap(self: SafeMath, exp: number = 0) {
    return unsafeBnToNumber(
      safeBN(self.value, self.percision).div(
        new BN(10).pow(new BN(self.percision))
      ),
      self.percision + exp
    );
  }
}
