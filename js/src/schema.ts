import type BN from "bn.js";
import Borsh from "@project-serum/borsh";

export enum SchemaVariant {
  CREATE = 0,
  MINT = 1,
  INITIALIZE = 2,
  SWAP = 3,
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

    return buffer.slice(0, Schema.schema.getSpan(buffer));
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
    Borsh.u64("initial_buy_amount"),
    Borsh.u64("maximum_market_cap"),
  ]);

  public readonly variant = SchemaVariant.INITIALIZE;

  constructor(
    public readonly initial_buy_amount: BN,
    public readonly maximum_market_cap: BN
  ) {
    super();
  }
}

export class SwapSchema extends Schema {
  static schema = Borsh.struct([
    Borsh.u8("variant"),
    Borsh.u64("amount"),
    Borsh.u8("direction"),
  ]);

  public readonly variant = SchemaVariant.SWAP;

  constructor(public readonly amount: BN, public readonly direction: 0 | 1) {
    super();
  }
}
