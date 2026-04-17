import { BN } from "@coral-xyz/anchor";
import { ConstantCurveCalculator, TradeDirection } from "./packages/zeroboost/src/curve";

function safeBN(value: any, decimals: number): BN {
    // Mimic `@hashfund/bn` safeBN
    // Usually it just converts to BN
    return new BN(value.toString());
}

function denormalizeBN(value: any, decimals: number): BN {
  return safeBN(Number(value), decimals).mul(new BN(10).pow(new BN(decimals)));
}

function normalizeBN(input: any, decimals: number): number {
  const bn = safeBN(input, decimals).div(new BN(10).pow(new BN(decimals)));
  return bn.toNumber();
}

function test() {
    const rawSupplyInput = 1000000000;
    const liquidityPercentage = 80;

    const rawSupply = denormalizeBN(rawSupplyInput, 6);
    console.log("rawSupply:", rawSupply.toString());

    const curve = new ConstantCurveCalculator(rawSupply, liquidityPercentage);
    console.log("curve.vt_0:", curve["vt_0"]);
    console.log("curve.vp_0:", curve["vp_0"]);
    console.log("curve.supply:", curve.supply.toString());
    console.log("curve.tokenBReserveBalance:", curve.tokenBReserveBalance.toString());

    const virtualTokenReserve = normalizeBN(curve.supply, 6);
    const virtualPairReserve = normalizeBN(curve.tokenBReserveBalance, 9);

    console.log("virtualTokenReserve:", virtualTokenReserve);
    console.log("virtualPairReserve:", virtualPairReserve);

    const tokenAmount = ConstantCurveCalculator.calculateAmountOutNumber(
      virtualTokenReserve,
      virtualPairReserve,
      1,
      TradeDirection.BtoA
    );
    console.log("tokenAmount calculated for 1 SOL:", tokenAmount);
}

test();
