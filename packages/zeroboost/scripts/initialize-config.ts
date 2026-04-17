import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { readFileSync } from "fs";
import { Keypair, Connection, clusterApiUrl } from "@solana/web3.js";
import { IDL, getEstimatedRaydiumCpPoolCreationFee, initializeConfig } from "../src";

const PROGRAM_ID = new web3.PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");

async function main() {
  // Load your payer keypair
  const keypairPath = process.env.HOME + "/.config/solana/id.json";
  const raw = JSON.parse(readFileSync(keypairPath, "utf-8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const wallet = {
    publicKey: payer.publicKey,
    signTransaction: async (tx: any) => { tx.sign(payer); return tx; },
    signAllTransactions: async (txs: any[]) => { txs.forEach(tx => tx.sign(payer)); return txs; },
  };

  const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
  const program = new Program(IDL, PROGRAM_ID, provider);

  console.log("Initializing config for program:", PROGRAM_ID.toBase58());
  console.log("Payer:", payer.publicKey.toBase58());

  const { pubkeys, signature } = await initializeConfig(
    program,
    payer.publicKey,
    {
      metadataCreationFee: 5,
      migrationPercentageFee: 5,
      minimumCurveUsdValuation: 4000,
      maximumCurveUsdValuation: 60000,
      estimatedRaydiumCpPoolFee: getEstimatedRaydiumCpPoolCreationFee(),
    }
  ).rpcAndKeys();

  console.log("✅ Config initialized!");
  console.log("  Config PDA:", pubkeys.config?.toBase58());
  console.log("  Signature:", signature);
}

main().catch((e) => {
  console.error("❌ Error:", e.message);
  process.exit(1);
});
