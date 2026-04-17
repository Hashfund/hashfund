console.log("Simulating math");
const rawSupply = 10000000000000000;
const liquidityPercentage = 80;
const ts = rawSupply * (liquidityPercentage / 100) / 1e6;

const initialMcUsd = 4000.0;
const p_0_usd = initialMcUsd / (rawSupply / 1e6);
const pairUsdPrice = 143;
let p_0_sol = p_0_usd / pairUsdPrice;

const targetSol = 85;
const max_p_0_sol = (targetSol * 0.99) / ts;
if (p_0_sol >= max_p_0_sol) {
    p_0_sol = max_p_0_sol;
}

const vt_0 = (targetSol * ts) / (targetSol - p_0_sol * ts);
const vp_0 = p_0_sol * vt_0;

console.log("vt_0:", vt_0);
console.log("vp_0:", vp_0);

const vt = BigInt(Math.round(vt_0 * 1e6)).toString();
const vp = BigInt(Math.round(vp_0 * 1e9)).toString();

const supplyNorm = Number.parseFloat(vt) / 1e6;
const reserveNorm = Number.parseFloat(vp) / 1e9;

console.log("supplyNorm:", supplyNorm);
console.log("reserveNorm:", reserveNorm);

const k = supplyNorm * reserveNorm;
const vtFinal = supplyNorm - 8000000000;
const vpFinal = k / vtFinal;
const solRequired = vpFinal - reserveNorm;

console.log("k:", k);
console.log("vtFinal:", vtFinal);
console.log("vpFinal:", vpFinal);
console.log("solRequired:", solRequired);
console.log("finalPrice:", vpFinal / vtFinal);
console.log("raydiumMC:", (vpFinal/vtFinal) * 10000000000 * 143);
