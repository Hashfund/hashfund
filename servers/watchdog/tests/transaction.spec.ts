import { Connection } from "@solana/web3.js";
import { parseLogs } from "@hashfund/program";

import { onLogs } from "../src/";
import { HTTP_RPC_ENDPOINT } from "../src/config";

async function main() {
  const connection = new Connection(HTTP_RPC_ENDPOINT);
  const signature =
    "63d5WMMbhT4QVjFVqpRhAHpTWnxVeNu5zn7EfANVtKGVE5FfLG4VJnj9jBA3ygXm2YvmsAfADHBS7UdzQy36hyba";
  const transaction = await connection.getParsedTransaction(signature);
  const logs = transaction!.meta!.logMessages!;
  const curve = parseLogs(logs)[1].InitializeCurve!;
  await onLogs({ logs, signature, err: [] });
}

main();
