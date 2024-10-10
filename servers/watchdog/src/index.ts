import "dotenv/config";
import {
  IDL,
  type Zeroboost,
  getBoundingCurvePda,
  devnet,
} from "@hashfund/zeroboost";
import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";
import {
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
    commitment: "finalized",
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

const main = async (program: Program<Zeroboost>) => {
  program.addEventListener(
    "MintEvent",
    catchAndRetryRuntimeError(async (data, _slot, signature) => {
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
    })
  );
  program.addEventListener(
    "SwapEvent",
    catchAndRetryRuntimeError(async (data, _slot, signature) => {
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
    })
  );
  program.addEventListener(
    "MigrateTriggerEvent",
    catchAndRetryRuntimeError(async (data) => {
      const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
      await updateBoundingCurveById(boundingCurve.toBase58(), {
        tradeable: false,
      });
      await program.methods
        .migrateFund({
          openTime: null,
        })
        .accounts({})
        .rpc();
    })
  );
  program.addEventListener(
    "MigrateEvent",
    catchAndRetryRuntimeError(async (data) => {
      const [boundingCurve] = getBoundingCurvePda(data.mint, program.programId);
      await getOrInsertBoundingCurve(program, boundingCurve);
    })
  );
};

main(program)
  .then(() => console.log("Running worker in background..."))
  .catch(console.error);
