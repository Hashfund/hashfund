import type BN from "bn.js";
import * as Borsh from "@project-serum/borsh";

export enum SchemeVariant {
  CREATE = 0,
  MINT = 1,
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

  static deserialize(buffer: Buffer | null) {
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

  public readonly variant = SchemeVariant.CREATE;

  constructor(
    public readonly name: string,
    public readonly ticker: string,
    public readonly uri: string,
    public readonly decimals: number
  ) {
    super();
  }
}

export class MintTokenSchema extends Schema {
  static schema = Borsh.struct([Borsh.u8("variant"), Borsh.u64("amount")]);
  public readonly variant = SchemeVariant.MINT;

  constructor(public readonly amount: BN) {
    super();
  }
}
