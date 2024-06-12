import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { BoundingCurveInfo } from "../src/state";
import { InitializeCurveSchema, SwapSchema } from "../src/schema";
import { findBoundingCurvePda, loadWallet } from "../src/utils";
import {
  createInitializeCurveInstruction,
  PROGRAM_ID,
  createSwapInstruction,
} from "../src";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

async function initializeCurve(connection: Connection) {
  const mint = new PublicKey("3ArDeXk29HB1navB22cWDnuUHqwAVUsKvAx61SeThw3K");
  const [boundingCurve] = findBoundingCurvePda(mint, PROGRAM_ID);

  const initializeCurveIx = createInitializeCurveInstruction({
    boundingCurve,
    tokenAMint: mint,
    tokenBMint: new PublicKey("So11111111111111111111111111111111111111112"),
    payer: wallet.publicKey,
    data: new InitializeCurveSchema(
      new BN(1).mul(new BN(10).pow(new BN(9))), /// buy 1 SOL
      new BN(5).mul(new BN(10).pow(new BN(9)))
    ),
  });

  const transaction = new Transaction();
  transaction.add(initializeCurveIx);

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function verifyBoundingCurveInfo(connection: Connection) {
  const account = await connection.getAccountInfo(
    new PublicKey("EiGoAkrMxPvMbZdg8rNAB5CXTWuqXM9puDSjYKLLAT2v")
  );

  const boundingCurve = BoundingCurveInfo.deserialize<BoundingCurveInfo>(
    account!.data
  );
  console.log(boundingCurve?.mint_address.toBase58());
}

async function buySwap(connection: Connection) {
  const mint = new PublicKey("3ArDeXk29HB1navB22cWDnuUHqwAVUsKvAx61SeThw3K");
  const [boundingCurve] = findBoundingCurvePda(mint, PROGRAM_ID);
  const sourceAta = await getAssociatedTokenAddress(mint, boundingCurve, true);
  const destinationAta = await getAssociatedTokenAddress(
    mint,
    wallet.publicKey,
    true
  );
  const ataIx = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    destinationAta,
    wallet.publicKey,
    mint
  );
  const ix = createSwapInstruction({
    mint,
    data: new SwapSchema(new BN(1).mul(new BN(10).pow(new BN(9))), 0),
    boundingCurve,
    source: sourceAta,
    destination: destinationAta,
    payer: wallet.publicKey,
  });

  const transaction = new Transaction();
  transaction.add(ataIx);
  transaction.add(ix);

  return sendAndConfirmTransaction(connection, transaction, [wallet]);
}

async function main() {
  const connection = new Connection(clusterApiUrl("devnet"));
  const tx = await buySwap(connection);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  console.log(await error.getLogs());
});
