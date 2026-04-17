import "dotenv/config";
import {
  type Zeroboost,
  getBoundingCurvePda,
  migrateFund,
} from "@hashfund/zeroboost";
import {
  Program,
  web3,
  EventParser,
  IdlEvents,
  BN,
  BorshCoder,
} from "@coral-xyz/anchor";
import {
  createMint,
  createSwap,
  upsertBoundingCurve,
  updateBoundingCurveById,
  upsertUser,
} from "@hashfund/api";

import { catchAndRetryRuntimeError, MultipleError } from "./error";
import { omit, safeFetch, safeParse } from "./utils";

export const getOrInsertBoundingCurve = async (
  program: Program<Zeroboost>,
  boundingCurveId: web3.PublicKey
) => {
  const boundingCurve = safeParse(
    Object.assign(
      { id: boundingCurveId },
      await program.account.boundingCurve.fetch(boundingCurveId)
    )
  );

  return upsertBoundingCurve({
    ...boundingCurve,
    initialPrice: String(boundingCurve.initialPrice),
    liquidityPercentage: String(boundingCurve.liquidityPercentage),
  } as any);
};

type Event<
  E extends "MigrateEvent" | "MigrateTriggerEvent" | "MintEvent" | "SwapEvent"
> = IdlEvents<Zeroboost>[E];

const onMintEvent = catchAndRetryRuntimeError<Event<"MintEvent">>(
  async (program, data, signature) => {
    await upsertUser({
      id: data.creator.toBase58(),
    });

    let metadata = null;
    try {
      console.log(`[Watchdog] Fetching metadata for ${data.mint.toBase58()} from ${data.uri}`);
      metadata = await safeFetch(data.uri);
    } catch (err) {
      console.warn(`[Watchdog] Failed to fetch metadata for ${data.mint.toBase58()}:`, err);
      metadata = {
        name: data.name,
        symbol: data.symbol,
        description: "Metadata fetch failed. Description pending indexing.",
        image: ""
      };
    }

    // Fetch the actual bonding curve account to get precise initial_supply and liquidity_percentage
    const boundingCurveAccount = await program.account.boundingCurve.fetch(data.boundingCurve);
    
    // Calculate Total Nominal Supply = (Initial Supply In Curve * 100) / Liquidity %
    // This represents the 100% supply (including the portion reserved for LP)
    const nominalSupply = (new BN(boundingCurveAccount.initialSupply.toString()).mul(new BN(100))).div(new BN(boundingCurveAccount.liquidityPercentage.toString()));
    
    console.log(`[Watchdog] Processing mint ${data.mint.toBase58()}:`);
    console.log(`  Initial supply in curve: ${boundingCurveAccount.initialSupply.toString()}`);
    console.log(`  Liquidity percentage:   ${boundingCurveAccount.liquidityPercentage.toString()}%`);
    console.log(`  Calculated nominal:      ${nominalSupply.toString()}`);

    await createMint({
      id: data.mint.toBase58(),
      uri: data.uri,
      name: data.name,
      symbol: data.symbol,
      creator: data.creator.toBase58(),
      supply: nominalSupply.toString(),
      metadata,
      signature,
      decimals: data.decimals,
    });

    await upsertBoundingCurve({
      id: data.boundingCurve.toBase58(),
      ...safeParse(boundingCurveAccount),
      initialPrice: String(boundingCurveAccount.initialPrice),
      liquidityPercentage: String(boundingCurveAccount.liquidityPercentage),
    } as any);
  }
);

const onSwapEvent = catchAndRetryRuntimeError<Event<"SwapEvent">>(
  async (program, data, signature) => {
    await upsertUser({
      id: data.payer.toBase58(),
    });
    const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
    const swap = omit(safeParse(data), "timestamp", "tradeDirection");

    await createSwap({
      ...swap,
      signature,
      tradeDirection: data.tradeDirection,
    });

    await getOrInsertBoundingCurve(program, boundingCurve);
  }
);

const onMigrateTriggerEvent = catchAndRetryRuntimeError<
  Event<"MigrateTriggerEvent">
>(async (program, data) => {
  const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
  await updateBoundingCurveById(boundingCurve.toBase58(), {
    tradeable: false,
  });
  await (
    await migrateFund(program, boundingCurve, program.provider.publicKey!, {
      openTime: new BN(0),
    })
  )
    .preInstructions([
      web3.ComputeBudgetProgram.setComputeUnitLimit({
        units: 300_000,
      }),
    ])
    .rpc();
});

const onMigrateEvent = catchAndRetryRuntimeError<Event<"MigrateEvent">>(
  async (program, data) => {
    const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
    await getOrInsertBoundingCurve(program, boundingCurve);
  }
);

export const buildEventListeners = (program: Program<Zeroboost>) => {
  const parser = new EventParser(
    program.programId,
    new BorshCoder(program.idl)
  );
  const eventListeners = {
    MintEvent: onMintEvent,
    SwapEvent: onSwapEvent,
    MigrateEvent: onMigrateEvent,
    MigrateTriggerEvent: onMigrateTriggerEvent,
  };

  return async (logs: web3.Logs) => {
    const events = Array.from(parser.parseLogs(logs.logs));
    console.log(events.map((event) => event.name));
    
    const errors: any[] = [];

    for (const event of events) {
      const method = eventListeners[event.name as keyof typeof eventListeners];
      await method(program, event.data as any, logs.signature).catch(
        (error) => errors.push(error)
      );
    }
    
    if(errors.length > 0) throw new MultipleError(...errors)

    return events.map((event) => event.name);
  };
};
