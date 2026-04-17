const { AnchorProvider, Program, web3, BN } = require("@coral-xyz/anchor");
const { readFileSync } = require("fs");
const { Keypair, Connection, clusterApiUrl } = require("@solana/web3.js");
const { IDL, initializeConfig, getEstimatedRaydiumCpPoolCreationFee } = require("../dist/index.js");

const PROGRAM_ID = new web3.PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");

async function main() {
  const keypairPath = process.env.HOME + "/.config/solana/id.json";
  const raw = JSON.parse(readFileSync(keypairPath, "utf-8"));
  const payer = Keypair.fromSecretKey(Uint8Array.from(raw));

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const wallet = {
    publicKey: payer.publicKey,
    signTransaction: async (tx) => { tx.sign(payer); return tx; },
    signAllTransactions: async (txs) => { txs.forEach(tx => tx.sign(payer)); return txs; },
  };

  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  // Override IDL metadata to match the newly deployed program ID
  const patchedIDL = { ...IDL, metadata: { ...IDL.metadata, address: PROGRAM_ID.toBase58() } };
  const program = new Program(patchedIDL, PROGRAM_ID, provider);

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
  console.error("❌ Error:", e.message || e);
  process.exit(1);
});
