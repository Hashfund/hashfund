const { BN } = require("@coral-xyz/anchor");

function unsafeBN(bn, decimals) { return bn; }
function safeBN(num, decimals) { return new BN(num.toString()); }

function denormalizeBN(value, decimals) {
  return unsafeBN(
    safeBN(Number(value), decimals).mul(new BN(10).pow(new BN(decimals))),
    decimals
  );
}

function normalizeBN(input, decimals) {
  const bn = unsafeBN(
    safeBN(input, decimals).div(new BN(10).pow(new BN(decimals))),
    decimals
  );
  return bn.toNumber();
}

console.log("denormalize 1,000,000,000 with 6 decimals:");
const rawSupply = denormalizeBN(1000000000, 6);
console.log(rawSupply.toString());

try {
    const supplyNorm = parseFloat(rawSupply.toString()) / 1e6;
    console.log("supplyNorm:", supplyNorm);
    const scale = 1.082;
    const vt_0 = supplyNorm * scale;
    console.log("vt_0:", vt_0);
    const supplyBN = new BN(BigInt(Math.round(vt_0 * 1e6)).toString());
    console.log("curve.supply:", supplyBN.toString());
    const normalizedSupply = normalizeBN(supplyBN, 6);
    console.log("virtualTokenReserve:", normalizedSupply);
} catch (e) {
    console.error("ERROR:", e.message);
}
