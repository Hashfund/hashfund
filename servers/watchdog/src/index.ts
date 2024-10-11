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

import { catchAndRetryRuntimeError } from "./error";
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

  return upsertBoundingCurve(boundingCurve);
};

type Event<
  E extends "MigrateEvent" | "MigrateTriggerEvent" | "MintEvent" | "SwapEvent"
> = IdlEvents<Zeroboost>[E];

const onMintEvent = catchAndRetryRuntimeError<Event<"MintEvent">>(
  async (program, data, signature) => {
    await upsertUser({
      id: data.creator.toBase58(),
    });
    const mint = omit(
      safeParse({ id: data.mint, ...data }),
      "decimals",
      "timestamp",
      "mint",
      "boundingCurve"
    );
    const metadata = await safeFetch(mint.uri);
    await createMint({
      ...mint,
      metadata,
      signature,
      decimals: data.decimals,
    });
    await getOrInsertBoundingCurve(program, data.boundingCurve);
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

    for (const event of events) {
      const method = eventListeners[event.name as keyof typeof eventListeners];
      await method(program, event.data as any, logs.signature);
    }

    return events.map((event) => event.name);
  };
};
