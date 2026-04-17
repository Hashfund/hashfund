import { NATIVE_MINT } from "@solana/spl-token";
import { safeBN, unsafeBN } from "@hashfund/bn";
import { type Program, BN, web3, AnchorProvider } from "@coral-xyz/anchor";
import {
  TradeDirection,
  type Zeroboost,
  devnet,
  getMintPda,
  mintToken,
  rawSwap,
} from "@hashfund/zeroboost";

import { object, number } from "yup";

import type { MetadataForm } from "./MetadataForm";

export const validateMintSupplySchema = object().shape({
  supply: number().min(1),
  liquidityPercentage: number().min(0).required(),
});

export const createInitialBuySchema = (balance: number) =>
  object().shape({
    amount: number()
      .max(balance, "Insufficient Balance")
      .min(0, "At least decimal greater then 0"),
  });

export type MintSupplyForm = {
  supply: number;
  liquidityPercentage: number;
};

export type MintInitialBuyForm = {
  pairAmount: number;
  tokenAmount: number;
};

export const processMintForm = async function (
  program: Program<Zeroboost>,
  {
    name,
    symbol,
    uri,
    decimals,
  }: Pick<MetadataForm, "name" | "symbol"> & {
    uri: string;
    decimals: number;
  },
  { supply, liquidityPercentage }: MintSupplyForm,
  initialBuyForm?: MintInitialBuyForm
) {
  const payer = program.provider.publicKey!;
  const [mint] = getMintPda(name, symbol, payer, program.programId);

  let instruction = mintToken(
    program,
    NATIVE_MINT,
    payer,
    {
      uri,
      name,
      symbol: symbol.slice(0, 10), // Safeguard IDL char limits
      decimals,
      liquidityPercentage,
      supply: (() => {
        let val = Number(supply);
        let rawAmount = BigInt(Math.floor(val * (10 ** decimals)));
        // Cap strictly at u64 MAX (18,446,744,073,709,551,615) to prevent `byte array longer than desired length`
        const U64_MAX = 18446744073709551615n;
        if (rawAmount > U64_MAX) rawAmount = U64_MAX;
        return new BN(rawAmount.toString());
      })(),
      migrationTarget: {
        raydium: {},
      },
    }
  ).preInstructions([
    web3.ComputeBudgetProgram.setComputeUnitLimit({
      units: 500_000,
    }),
  ]);

  if (initialBuyForm && initialBuyForm.pairAmount > 0) {
    const { pairAmount } = initialBuyForm;

    instruction = instruction.postInstructions([
      await (
        await rawSwap(program, mint, NATIVE_MINT, payer, {
          amount: (() => {
            let val = Number(pairAmount);
            let rawAmount = BigInt(Math.floor(val * 1e9));
            const U64_MAX = 18446744073709551615n;
            if (rawAmount > U64_MAX) rawAmount = U64_MAX;
            return new BN(rawAmount.toString());
          })(),
          tradeDirection: TradeDirection.BtoA,
        })
      ).instruction(),
    ]);
  }

  const provider = program.provider as AnchorProvider;
  const connection = provider.connection;

  const getTx = async () => {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = await instruction.transaction();
    tx.recentBlockhash = blockhash;
    tx.feePayer = payer;
    return { tx, blockhash, lastValidBlockHeight };
  };

  try {
    const { tx, blockhash, lastValidBlockHeight } = await getTx();
    
    // Sign the transaction using the Anchor provider's wallet
    const signedTx = await provider.wallet.signTransaction(tx);
    
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    // Wait for confirmation with the blockhash and height we obtained
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, "confirmed");

    return [mint, signature] as const;
  } catch (err: any) {
    console.error("Minting failed, attempting retry with fresh blockhash...", err);
    
    // Retry once for transient blockhash errors
    const { tx, blockhash, lastValidBlockHeight } = await getTx();
    const signedTx = await provider.wallet.signTransaction(tx);
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
    });

    await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
    }, "confirmed");

    return [mint, signature] as const;
  }
};
