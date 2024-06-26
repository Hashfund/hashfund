import { program } from "commander";

import { Keypair } from "@solana/web3.js";
import { writeFileSync } from "fs";

function generateRandomKeypair(num: number) {
  for (let i = 1; i <= num; i++) {
    const keypair = new Keypair();
    writeFileSync(
      `./tests/test-keypair/random${i}.json`,
      JSON.stringify(Array.from(keypair.secretKey.values()))
    );
  }
}

program
  .version("1.0.0")
  .description("Generate random keypair files")
  .option("-n, --number <type>", "Number of keypairs to generate")
  .action((options) => {
    generateRandomKeypair(options.number);
  });


program.parse(process.argv);