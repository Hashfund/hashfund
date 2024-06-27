import BN from "bn.js";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { loadWallet } from "./utils";
import {
  createHashTokenInstructions,
  RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  RAYDIUM_DEVNET_PROGRAM_ID,
} from "../src";
import { generatePublicKey } from "../src/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const mint = new PublicKey("64VnzwzgMxLBnnWwWQapeRV2C6y63okxdDqU97NCK6gG");

async function hashToken(connection: Connection, wallet: Keypair) {
  const market = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  });
  const asks = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  });
  const bids = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  });
  const eventQueue = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  });
  const requestQueue = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  });
  const tokenAVault = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: TOKEN_PROGRAM_ID,
  });
  const tokenBVault = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: TOKEN_PROGRAM_ID,
  });

  console.log("market=", market.publicKey.toBase58());
  console.log("asks=", asks.publicKey.toBase58());
  console.log("bids=", bids.publicKey.toBase58());
  console.log("eventQueue=", eventQueue.publicKey.toBase58());
  console.log("requestQueue=", requestQueue.publicKey.toBase58());
  console.log("tokenAVault=", tokenAVault.publicKey.toBase58());
  console.log("tokenBVault=", tokenBVault.publicKey.toBase58());

  const [ix0, ix1, ix2] = await createHashTokenInstructions({
    connection,
    market,
    asks,
    bids,
    eventQueue,
    requestQueue,
    serumProgram: RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
    ammProgram: RAYDIUM_DEVNET_PROGRAM_ID,
    serumTokenAVault: tokenAVault,
    serumTokenBVault: tokenBVault,
    tokenAMint: mint,
    tokenAMintInfo: {
      decimals: 6,
    },
    payer: wallet.publicKey,
    data: {
      openTime: new BN(0),
      tokenAAmount: new BN(0).mul(new BN(10).pow(new BN(6))),
      tokenBAmount: new BN(1).mul(new BN(10).pow(new BN(5))),
      coinLotSize: new BN(1_000).mul(new BN(10).pow(new BN(6))),
      pcLotSize: new BN(10_000).mul(new BN(10).pow(new BN(9))),
      pcDustThreshhold: new BN(100),
    },
  });

  const ix3 = ComputeBudgetProgram.setComputeUnitLimit({
    units: 400_000,
  });

  const tx0 = new Transaction().add(...ix0);
  const tx1 = new Transaction().add(...ix1);
  const tx2 = new Transaction().add(ix3).add(ix2);

  tx0.feePayer = wallet.publicKey;
  tx1.feePayer = wallet.publicKey;
  tx2.feePayer = wallet.publicKey;

  const sig0 = await sendAndConfirmTransaction(connection, tx0, [wallet], {
    commitment: "finalized",
  });
  console.log("first tx done ✅");
  const sig1 = await sendAndConfirmTransaction(connection, tx1, [wallet], {
    commitment: "finalized",
  });
  console.log("second tx done ✅");

  const sig2 = await sendAndConfirmTransaction(connection, tx2, [wallet], {
    commitment: "finalized",
  });
  console.log("last tx done ✅");

  console.log(sig0);
  console.log(sig1);
  console.log(sig2);
}

async function main() {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  await hashToken(connection, wallet);
}

main().catch(async (error) => {
  console.log(error);
  if (error.getLogs) {
    console.log(await error.getLogs());
  }
});
