import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { IDL, Zeroboost, initializeConfig, getEstimatedRaydiumCpPoolCreationFee } from "../src";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import path from "path";

async function main() {
  // Configure the client to use the provider from environment or anchor.toml
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const programId = new PublicKey("G9hckfQ5yPjyqF9jTfPm2t3tBTxefgqrFrPPJsF8UJY6");
  const program = new Program(IDL as any, programId, provider) as Program<Zeroboost>;
  const admin = provider.wallet.publicKey;

  console.log("Admin:", admin.toBase58());
  console.log("Program ID:", program.programId.toBase58());

  // Current production/devnet config values
  const metadataCreationFee = 5;
  const migrationPercentageFee = 5;
  const minimumCurveUsdValuation = 4000;
  const maximumCurveUsdValuation = 60000;
  const estimatedRaydiumCpPoolFee = getEstimatedRaydiumCpPoolCreationFee();

  console.log("Initializing config on Devnet...");
  
  try {
    const signature = await initializeConfig(
      program,
      admin,
      {
        metadataCreationFee,
        migrationPercentageFee,
        minimumCurveUsdValuation,
        maximumCurveUsdValuation,
        estimatedRaydiumCpPoolFee,
      }
    ).rpc();

    console.log("Success! Transaction signature:", signature);
  } catch (err: any) {
    console.error("Error initializing config:", err);
    if (err.logs) {
      console.error("Logs:", err.logs);
    }
  }
}

main().then(
  () => process.exit(0),
  (err: any) => {
    console.error(err);
    process.exit(1);
  }
);
