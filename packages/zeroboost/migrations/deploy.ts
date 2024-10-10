import "dotenv/config";
import { readFileSync } from "fs";
import { AnchorProvider, Program, Wallet, web3 } from "@coral-xyz/anchor";

import {
  IDL,
  devnet,
  getEstimatedRaydiumCpPoolCreationFee,
  initializeConfig,
} from "../src";

const main = async function () {
  const connection = new web3.Connection(process.env.ANCHOR_PROVIDER_URL!);
  const wallet = new Wallet(
    web3.Keypair.fromSecretKey(
      Uint8Array.from(
        JSON.parse(readFileSync(process.env.ANCHOR_WALLET!, "utf-8"))
      )
    )
  );

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });
  const program = new Program(IDL, devnet.ZERO_BOOST_PROGRAM, provider);

  const tx = await initializeConfig(program, program.provider.publicKey!, {
    metadataCreationFee: 1,
    migrationPercentageFee: 5,
    minimumCurveUsdValuation: 4000,
    maximumCurveUsdValuation: 60000,
    estimatedRaydiumCpPoolFee: getEstimatedRaydiumCpPoolCreationFee(),
  }).rpc();

  console.info("[info] zeroboost initialization signature=" + tx);
};

main().catch(console.log);
