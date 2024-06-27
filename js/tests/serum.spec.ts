import BN from "bn.js";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemInstruction,
  Transaction,
} from "@solana/web3.js";

import { loadWallet } from "./utils";
import {
  createInitializeRaydiumInstructions,
  createInitializeSerumMarketInstructions,
  RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
} from "../src";
import { generatePublicKey } from "../src/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const mint = new PublicKey("64VnzwzgMxLBnnWwWQapeRV2C6y63okxdDqU97NCK6gG");

async function createSerumMarket(connection: Connection, wallet: Keypair) {
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

  console.log("market={}", market.publicKey.toBase58());

  const [ix0, ix1, ix2] = await createInitializeSerumMarketInstructions({
    connection,
    market,
    asks,
    bids,
    eventQueue,
    requestQueue,
    tokenAVault,
    tokenBVault,
    payer: wallet.publicKey,
    tokenAMint: mint,
    data: {
      coinLotSize: new BN(1_000).mul(new BN(10).pow(new BN(6))),
      pcLotSize: new BN(10_000).mul(new BN(10).pow(new BN(9))),
      pcDustThreshhold: new BN(100),
    },
  });

  const ix3 = ComputeBudgetProgram.setComputeUnitLimit({
    units: 250_000,
  });

  const ix4 = createInitializeRaydiumInstructions({
    market: new PublicKey("GNjwhjZLtxQhj5nkYTcgWDSCy9iAi7C1LCh9mV2Q7BTf"),
    tokenAMint: mint,
    tokenAMintInfo: {
      decimals: 6,
    },
    payer: wallet.publicKey,
    data: {
      openTime: new BN(0),
      tokenAAmount: new BN(1).mul(new BN(10).pow(new BN(6))),
      tokenBAmount: new BN(1).mul(new BN(10).pow(new BN(8))),
    },
  });

  const tx0 = new Transaction().add(...ix0);
  const tx1 = new Transaction().add(...ix1);
  const tx2 = new Transaction().add(...ix2);
  const tx3 = new Transaction().add(ix3).add(ix4);

  tx0.feePayer = wallet.publicKey;
  tx1.feePayer = wallet.publicKey;
  tx2.feePayer = wallet.publicKey;
  tx3.feePayer = wallet.publicKey;

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
  console.log("third tx done ✅");
  const sig3 = await sendAndConfirmTransaction(connection, tx3, [wallet], {
    commitment: "finalized",
  });
  console.log("last tx done ✅");

  console.log(sig0);
  console.log(sig1);
  console.log(sig2);
  console.log(sig3);
}

async function main() {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  await createSerumMarket(connection, wallet);
}

main().catch(async (error) => {
  console.log(error);
  if (error.getLogs) {
    console.log(await error.getLogs());
  }
});
