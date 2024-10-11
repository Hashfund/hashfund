import "dotenv/config";
import {
  IDL,
  type Zeroboost,
  getBoundingCurvePda,
  devnet,
  migrateFund,
} from "@hashfund/zeroboost";
import {
  AnchorProvider,
  Program,
  Wallet,
  web3,
  BorshCoder,
  EventParser,
  IdlEvents,
  BN,
} from "@coral-xyz/anchor";
import {
  db,
  createMint,
  createSwap,
  upsertBoundingCurve,
  updateBoundingCurveById,
  upsertUser,
} from "@hashfund/api";

import { catchAndRetryRuntimeError } from "./error";
import { omit, safeFetch, safeParse } from "./utils";
import { ANCHOR_PROVIDER_URL, ANCHOR_WALLET } from "./config";

const provider = new AnchorProvider(
  new web3.Connection(ANCHOR_PROVIDER_URL),
  new Wallet(ANCHOR_WALLET),
  {
    commitment: "confirmed",
  }
);
const program = new Program(IDL, devnet.ZERO_BOOST_PROGRAM, provider);

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
  async (data, _slot, signature) => {
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
  async (data, _slot, signature) => {
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
>(async (data) => {
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
  async (data) => {
    const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
    await getOrInsertBoundingCurve(program, boundingCurve);
  }
);

export const buildEventListeners = (parser: EventParser) => {
  const eventListeners = {
    MintEvent: onMintEvent,
    SwapEvent: onSwapEvent,
    MigrateEvent: onMigrateEvent,
    MigrateTriggerEvent: onMigrateTriggerEvent,
  };

  return async (logs: web3.Logs, context: web3.Context) => {
    const events = Array.from(parser.parseLogs(logs.logs));
    for (const event of events) {
      const method = eventListeners[event.name as keyof typeof eventListeners];
      if (Boolean(method)) await method(event.data as any, context.slot, logs.signature);
    }

    return Array.from(events).map((event) => event.name);
  };
};

const main = async (program: Program<Zeroboost>) => {
  const parser = new EventParser(
    program.programId,
    new BorshCoder(program.idl)
  );

  const onLogs = buildEventListeners(parser);

  program.provider.connection.onLogs(
    program.programId,
    (logs, context) => {
      console.log("[pending] signature=", logs.signature);

      onLogs(logs, context)
        .then(() => console.log("[success] signature=", logs.signature))
        .catch((error) => console.log("[error] signature=", logs.signature, error));
    },
    "finalized"
  );
};

main(program)
  .then(() => console.log("Running worker in background..."))
  .catch(console.error);
