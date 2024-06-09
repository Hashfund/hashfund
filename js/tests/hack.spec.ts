import {
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { loadWallet } from "../src/utils";

async function main() {
  let wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  const connection = new Connection(clusterApiUrl("devnet"));
  const mint = new PublicKey("27CRaAB14zUd2T8NCmsbdfvHgxi9hjkK9oUKqvMSQEWi");
  const ata = await getOrCreateAssociatedTokenAccount(
    connection,
    wallet,
    mint,
    wallet.publicKey,
    true
  );

  // const ataInstruction = createAssociatedTokenAccountInstruction(
  //   wallet.publicKey,
  //   ata,
  //   wallet.publicKey,
  //   mint
  // );

  const mintInstruction = await createMintToInstruction(
    mint,
    ata.address,
    wallet.publicKey,
    1_000_000_000_000_000
  );

  const transaction = new Transaction().add(mintInstruction);
  const tx = await sendAndConfirmTransaction(connection, transaction, [wallet]);
  console.log("tx={}", tx);
}

main().catch((e) => {
  console.log(e);
});
