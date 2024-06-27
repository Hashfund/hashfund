import BN from "bn.js";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { simulateTransaction } from "@raydium-io/raydium-sdk";

import { loadWallet } from "./utils";
import {
  createInitializeRaydiumInstructions,
  createInitializeSerumMarketInstructions,
  RAYDIUM_DEVNET_OPEN_BOOK_PROGRAM_ID,
  RAYDIUM_OPEN_BOOK_PROGRAM_ID,
  SERUM_DEVNET_PROGRAM_ID,
} from "../src";
import { generatePublicKey } from "../src/utils";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const mint = new PublicKey("64VnzwzgMxLBnnWwWQapeRV2C6y63okxdDqU97NCK6gG");

async function createSerumMarket(connection: Connection, wallet: Keypair) {
  const market = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: SERUM_DEVNET_PROGRAM_ID,
  });
  const asks = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: SERUM_DEVNET_PROGRAM_ID,
  });
  const bids = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: SERUM_DEVNET_PROGRAM_ID,
  });
  const eventQueue = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: SERUM_DEVNET_PROGRAM_ID,
  });
  const requestQueue = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: SERUM_DEVNET_PROGRAM_ID,
  });
  const tokenAVault = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: TOKEN_PROGRAM_ID,
  });
  const tokenBVault = generatePublicKey({
    fromPublicKey: wallet.publicKey,
    programId: TOKEN_PROGRAM_ID,
  });

  const [ix0, ix1, ix2] = await createInitializeSerumMarketInstructions({
    connection,
    market,
    asks,
    serumProgram: SERUM_DEVNET_PROGRAM_ID,
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

  const ix3 = createInitializeRaydiumInstructions({
    market: market.publicKey,
    tokenAMint: mint,
    tokenAMintInfo: {
      decimals: 6,
    },
    payer: wallet.publicKey,
    data: {
      openTime: new BN(0),
      tokenAAmount: new BN(0).mul(new BN(10).pow(new BN(6))),
      tokenBAmount: new BN(0).mul(new BN(10).pow(new BN(9)))
    },
  })

  const tx0 = new Transaction().add(...ix0);
  const tx1 = new Transaction().add(...ix1);
  const tx2 = new Transaction().add(...ix2);
  const tx3 = new Transaction().add(ix3);

  Array.from(ix2[0].keys).map((a) => console.log(a.pubkey.toBase58()))

  tx0.feePayer = wallet.publicKey;
  tx1.feePayer = wallet.publicKey;
  tx2.feePayer = wallet.publicKey;
  tx3.feePayer = wallet.publicKey;

  return simulateTransaction(connection, [tx0, tx1, tx2], true);
}

async function main() {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  const tx = await createSerumMarket(connection, wallet);
  console.log("tx=", tx);
}

main().catch(async (error) => {
  console.log(error);
  if (error.getLogs) {
    console.log(await error.getLogs());
  }
});
