import { BN } from "@coral-xyz/anchor";
import { ConstantCurveCalculator, TradeDirection } from "./src/curve";

function test() {
  const supply = new BN(BigInt(1000000000n * 10n**9n).toString()); // 1B supply, 9 decimals
  const liquidityPercentage = 80;
  const decimals = 9;

  const curve = new ConstantCurveCalculator(supply, liquidityPercentage, decimals);
  
  // SOL amounts in human numbers (e.g. 1 SOL)
  const amountInSol = 1;
  
  // Calculate tokens out using human-readable numbers math
  const vt0 = (curve as any).vt_0;
  const vp0 = (curve as any).vp_0;
  
  const tokensOut = ConstantCurveCalculator.calculateAmountOutNumber(
    vt0,
    vp0,
    amountInSol,
    TradeDirection.BtoA
  );
  
  console.log(`1 SOL buys: ${tokensOut} tokens`);

  // Calculate using raw BN math (on-chain style)
  const rawAmountInSol = new BN(BigInt(amountInSol * 1e9).toString());
  const rawVt0 = (curve as any).supply; // This is unscaled base units? No, let's check.
  const rawVp0 = (curve as any).tokenBReserveBalance;
  
  const rawTokensOut = ConstantCurveCalculator.calculateAmountOut(
      curve.supply,
      curve.tokenBReserveBalance,
      rawAmountInSol,
      TradeDirection.BtoA
  );

  console.log(`1 SOL (raw) buys: ${rawTokensOut.toString()} base units`);
  console.log(`Which is ${Number(rawTokensOut.toString()) / 1e9} tokens (if 9 decimals)`);
}

test();
