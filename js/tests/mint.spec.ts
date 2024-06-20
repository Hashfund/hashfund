import { BN } from "bn.js";
import {
  clusterApiUrl,
  Connection,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { loadWallet } from "./utils";
import {
  createInitializeCurveInstruction,
  createMintInstruction,
  createSwapInInstruction,
  createSwapOutInstruction,
} from "../src";
import { NATIVE_MINT } from "@solana/spl-token";

const main = async () => {
  const connection: Connection = new Connection(clusterApiUrl("devnet"));
  const wallet = loadWallet("/Users/macbookpro/.config/solana/id.json");

  const [mint, instructions] = createMintInstruction({
    data: {
      name: "Pepe #3",
      ticker: "Pepe",
      uri: "https://ik.imagekit.io/hashfund/dev/pepe.json",
    },
    payer: wallet.publicKey,
  });

  console.log("mint={}", mint.toBase58());
  const transaction = new Transaction().add(...instructions).add(
    ...(await createInitializeCurveInstruction({
      connection,
      tokenAMint: mint,
      tokenBMint: NATIVE_MINT,
      payer: wallet.publicKey,
      data: {
        initialBuyAmount: new BN(1).mul(new BN(10).pow(new BN(9))),
        maximumMarketCap: new BN(4).mul(new BN(10).pow(new BN(9))),
      },
    })),
    // createSwapInInstruction({
    //   connection,
    //   tokenAMint: mint,
    //   payer: wallet.publicKey,
    //   data: {
    //     amount: new BN(1).mul(new BN(10).pow(new BN(9))),
    //   },
    // })
  );
  const tx = await sendAndConfirmTransaction(connection, transaction, [wallet]);

  console.log("tx={}", tx);
};

main().catch(async (e) => {
  console.log(e);
  console.log(await e.getLogs());
});
