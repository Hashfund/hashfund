export const Explorer = {
  buildTx(signature: string) {
    return `https://solscan.io/tx/${signature}?cluster=devnet`;
  },
  buildAccount(signature: string) {
    return `https://solscan.io/account/${signature}?cluster=devnet`;
  },
  buildRaydium(mint: string) {
    return `https://raydium.io/swap/?inputMint=sol&outputMint=${mint}`;
  },
};
