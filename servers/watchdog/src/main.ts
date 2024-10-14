import { devnet, IDL, Zeroboost } from "@hashfund/zeroboost";
import { Program, AnchorProvider, Wallet, web3 } from "@coral-xyz/anchor";

import { buildEventListeners } from ".";
import { MultipleError } from "./error";
import { ANCHOR_PROVIDER_URL, ANCHOR_WALLET } from "./config";

const provider = new AnchorProvider(
  new web3.Connection(ANCHOR_PROVIDER_URL),
  new Wallet(ANCHOR_WALLET),
  {
    commitment: "confirmed",
  }
);
const program = new Program(IDL, devnet.ZERO_BOOST_PROGRAM, provider);

const main = async (program: Program<Zeroboost>) => {
  const onLogs = buildEventListeners(program);

  program.provider.connection.onLogs(
    program.programId,
    (logs) => {
      console.log("[pending] signature=", logs.signature);

      onLogs(logs)
        .then(() => console.log("[success] signature=", logs.signature))
        .catch((error: MultipleError) => {
          console.log("[error] signature=", logs.signature);
          error.log();
        });
    },
    "finalized"
  );
};

main(program)
  .then(() => console.log("Running worker in background..."))
  .catch(console.error);
